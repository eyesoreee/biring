import { PowerSyncDatabase } from "@powersync/react-native";

import { supabase } from "@/lib/supabase";

import { AppSchema } from "./AppSchema";
import { Connector } from "./Connector";

export const powersync = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: "biring.db" },
});

const connector = new Connector();

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    void powersync.disconnect();
    return;
  }
  if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
    void powersync.connect(connector);
  }
});

export async function waitForMembership(
  householdId: string,
  userId: string,
  timeoutMs = 10000,
) {
  if (!householdId || !userId) return false;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const row = await powersync.getOptional<{ id: string }>(
      `SELECT id FROM household_member
       WHERE household_id = ? AND user_id = ? AND left_at IS NULL`,
      [householdId, userId],
    );
    if (row) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

export async function logout() {
  const stats = await powersync.getUploadQueueStats();
  if (stats.count > 0) {
    throw new Error(
      `${stats.count} changes have not synced yet. Connect to the internet before logging out.`,
    );
  }
  await supabase.auth.signOut();
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    throw new Error("Could not sign out. Please try again.");
  }
  await powersync.disconnectAndClear();
}
