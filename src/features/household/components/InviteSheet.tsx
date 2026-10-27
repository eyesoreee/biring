import { useStatus } from "@powersync/react";
import { createURL } from "expo-linking";
import { useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";
import { useAsyncLock } from "@/lib/useAsyncLock";
import { rpc } from "@/powersync/rpc";

import type { Household } from "../types";

export function InviteSheet({
  visible,
  onClose,
  household,
  householdId,
  isOwner,
}: {
  visible: boolean;
  onClose: () => void;
  household?: Household;
  householdId: string;
  isOwner: boolean;
}) {
  const { connected } = useStatus();
  const [newCode, setNewCode] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const runLocked = useAsyncLock();

  const code = newCode ?? household?.invite_code ?? null;
  const link = code
    ? createURL("/household/join", { queryParams: { code } })
    : null;

  const close = () => {
    setNewCode(null);
    onClose();
  };

  const shareInvite = () => {
    if (!household || !link) return;
    Share.share({
      message: `Join ${household.name} on biring: ${link}`,
    }).catch(() => {});
  };

  const rotate = () =>
    runLocked(async () => {
      setRotating(true);
      try {
        const next = await rpc<string>("regenerate_invite_code", {
          p_household_id: householdId,
        });
        setNewCode(next);
      } catch (cause) {
        Alert.alert(
          "Can't create a new code",
          cause instanceof Error ? cause.message : "Please try again.",
        );
      } finally {
        setRotating(false);
      }
    });

  const confirmRotate = () => {
    Alert.alert(
      "Create a new invite code?",
      "The current link and QR code will stop working immediately.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "New code", style: "destructive", onPress: rotate },
      ],
    );
  };

  return (
    <Sheet visible={visible} onClose={close}>
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
        {code ?? "—"}
      </Text>
      <View className="flex-row justify-end gap-2">
        <BrandButton variant="text" label="Close" onPress={close} />
        <BrandButton label="Share" disabled={!link} onPress={shareInvite} />
      </View>
      {isOwner ? (
        <BrandButton
          fullWidth
          variant="outlined"
          label={rotating ? "Creating…" : "Create a new code"}
          disabled={rotating || !connected}
          onPress={confirmRotate}
        />
      ) : null}
    </Sheet>
  );
}
