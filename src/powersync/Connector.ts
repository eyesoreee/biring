import {
  type CommonPowerSyncDatabase,
  type CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
  UpdateType,
} from "@powersync/react-native";
import { Alert } from "react-native";

import { supabase } from "@/lib/supabase";

const FATAL = [/^22...$/, /^23...$/, /^42501$/];

class RejectedWriteError extends Error {}

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_URL;
    if (!endpoint) throw new Error("Missing EXPO_PUBLIC_POWERSYNC_URL");

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!session || error) throw new Error("No Supabase session");

    return {
      endpoint,
      token: session.access_token,
    };
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const tx = await database.getNextCrudTransaction();
    if (!tx) return;

    let lastOp: CrudEntry | null = null;
    try {
      for (const op of tx.crud) {
        lastOp = op;
        const table = supabase.from(op.table);
        const res =
          op.op === UpdateType.PUT
            ? await table.upsert({ ...op.opData, id: op.id }).select("id")
            : op.op === UpdateType.PATCH
              ? await table.update(op.opData!).eq("id", op.id).select("id")
              : await table.delete().eq("id", op.id).select("id");
        if (res.error) throw res.error;
        if (op.op !== UpdateType.DELETE && !res.data?.length) {
          throw new RejectedWriteError("The server did not apply this change");
        }
      }
      await tx.complete();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code;
      if (
        e instanceof RejectedWriteError ||
        (typeof code === "string" && FATAL.some((r) => r.test(code)))
      ) {
        console.error("Data upload error - discarding:", {
          table: lastOp?.table,
          op: lastOp?.op,
          id: lastOp?.id,
          code,
          message: (e as { message?: string })?.message,
        });
        Alert.alert(
          "Change not saved",
          "The server rejected a recent change, so it was removed from this device. Check that you still have access, then try again.",
        );
        await tx.complete();
      } else {
        throw e;
      }
    }
  }
}
