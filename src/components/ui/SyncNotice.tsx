import { useStatus } from "@powersync/react";
import { Text, View } from "react-native";

export function SyncNotice() {
  const { connected, uploadError, downloadError } = useStatus();

  if (!connected || (!uploadError && !downloadError)) return null;

  return (
    <View className="mb-3 gap-1 rounded-2xl border border-edge bg-surface px-4 py-3 dark:border-graphite-border dark:bg-graphite-surface">
      {uploadError ? (
        <Text className="font-sans text-sm text-muted dark:text-silver">
          Some changes haven&apos;t reached the server. They&apos;re saved on
          this device and we&apos;ll keep retrying.
        </Text>
      ) : null}
      {downloadError ? (
        <Text className="font-sans text-sm text-muted dark:text-silver">
          Couldn&apos;t refresh data. Showing what&apos;s saved on this device.
        </Text>
      ) : null}
    </View>
  );
}
