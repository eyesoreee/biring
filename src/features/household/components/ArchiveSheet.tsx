import { Text, View } from "react-native";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";

export function ArchiveSheet({
  visible,
  name,
  busy,
  onClose,
  onArchive,
}: {
  visible: boolean;
  name?: string;
  busy: boolean;
  onClose: () => void;
  onArchive: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={busy ? () => {} : onClose}>
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Archive {name ? `“${name}”` : "this household"}?
      </Text>
      <Text className="font-sans text-base text-muted dark:text-silver">
        It disappears from your list and can&apos;t be restored in the app.
      </Text>
      <View className="gap-2">
        <BrandButton
          fullWidth
          variant="destructive"
          label={busy ? "Archiving…" : "Archive household"}
          disabled={busy}
          onPress={onArchive}
        />
        <BrandButton
          fullWidth
          variant="text"
          label="Cancel"
          disabled={busy}
          onPress={onClose}
        />
      </View>
    </Sheet>
  );
}
