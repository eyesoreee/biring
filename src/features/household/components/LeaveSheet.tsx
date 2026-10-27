import { Text, View } from "react-native";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";

export function LeaveSheet({
  visible,
  name,
  busy,
  onClose,
  onLeave,
}: {
  visible: boolean;
  name?: string;
  busy: boolean;
  onClose: () => void;
  onLeave: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={busy ? () => {} : onClose}>
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Leave {name ? `“${name}”` : "this household"}?
      </Text>
      <Text className="font-sans text-base text-muted dark:text-silver">
        You&apos;ll stop seeing its expenses. An owner can invite you back with
        a code.
      </Text>
      <View className="gap-2">
        <BrandButton
          fullWidth
          variant="destructive"
          label={busy ? "Leaving…" : "Leave household"}
          disabled={busy}
          onPress={onLeave}
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
