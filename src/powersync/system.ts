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
  if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
    powersync.connect(connector);
  }
});

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
