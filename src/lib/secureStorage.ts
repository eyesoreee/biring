import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 500;

const chunkKey = (key: string, index: number) => `${key}.${index}`;
const countKey = (key: string) => `${key}.count`;

async function removeValue(key: string) {
  const count = Number((await SecureStore.getItemAsync(countKey(key))) ?? 0);
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, index)),
    ),
  );
  await SecureStore.deleteItemAsync(countKey(key));
}

export const secureStorage = {
  async getItem(key: string) {
    const count = Number((await SecureStore.getItemAsync(countKey(key))) ?? 0);
    if (!count) return null;

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index)),
      ),
    );
    if (chunks.some((chunk) => chunk === null)) return null;
    return chunks.join("");
  },

  async setItem(key: string, value: string) {
    await removeValue(key);

    const characters = Array.from(value);
    const chunks: string[] = [];
    for (let index = 0; index < characters.length; index += CHUNK_SIZE) {
      chunks.push(characters.slice(index, index + CHUNK_SIZE).join(""));
    }

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk),
      ),
    );
    await SecureStore.setItemAsync(countKey(key), String(chunks.length));
  },

  async removeItem(key: string) {
    await removeValue(key);
  },
};
