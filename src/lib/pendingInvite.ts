import Storage from "expo-sqlite/kv-store";

const KEY = "pending-invite-code";

export async function savePendingInvite(code: string) {
  await Storage.setItem(KEY, code);
}

export async function takePendingInvite() {
  const code = await Storage.getItem(KEY);
  if (code) await Storage.removeItem(KEY);
  return code;
}
