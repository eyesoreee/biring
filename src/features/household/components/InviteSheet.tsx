import { Share, Text, View } from "react-native";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";

import type { Household } from "../types";

export function InviteSheet({
  visible,
  onClose,
  household,
}: {
  visible: boolean;
  onClose: () => void;
  household?: Household;
}) {
  const shareInvite = () => {
    if (!household) return;
    Share.share({
      message: `Join ${household.name} on biring with this invite code: ${household.invite_code}`,
    }).catch(() => {});
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Invite a family member
      </Text>
      <Text className="font-sans text-base text-muted dark:text-silver">
        Anyone with this code can join this household.
      </Text>
      <Text
        selectable
        className="rounded-2xl border border-edge bg-canvas px-4 py-3 text-center font-sans-medium text-lg tracking-wider text-graphite dark:border-graphite-border dark:bg-graphite-surface dark:text-on-graphite"
      >
        {household?.invite_code ?? "—"}
      </Text>
      <View className="flex-row justify-end gap-2">
        <BrandButton variant="text" label="Close" onPress={onClose} />
        <BrandButton
          label="Share"
          disabled={!household}
          onPress={shareInvite}
        />
      </View>
    </Sheet>
  );
}
