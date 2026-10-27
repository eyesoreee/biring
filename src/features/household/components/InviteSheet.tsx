import { createURL } from "expo-linking";
import { Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

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
  const link = household
    ? createURL("/household/join", {
        queryParams: { code: household.invite_code },
      })
    : null;

  const shareInvite = () => {
    if (!household || !link) return;
    Share.share({
      message: `Join ${household.name} on biring: ${link}`,
    }).catch(() => {});
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Invite a family member
      </Text>
      <Text className="font-sans text-base text-muted dark:text-silver">
        Scan with a camera to join, or share the link.
      </Text>

      {link ? (
        <View className="items-center">
          <View className="rounded-2xl bg-white p-4">
            <QRCode value={link} size={190} />
          </View>
        </View>
      ) : null}

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
