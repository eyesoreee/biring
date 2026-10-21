import { supabase } from "@/lib/supabase";

import { powersync } from "./system";

export async function rpc<T = void>(
  fn: string,
  args: Record<string, unknown>,
): Promise<T> {
  if (!powersync.currentStatus.connected) throw new Error("You are offline.");
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data as T;
}
