import { Text, View } from "react-native";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";

import type { Member, Role } from "../types";

export function MemberSheet({
  member,
  busy,
  offline,
  onClose,
  onChangeRole,
  onKick,
}: {
  member: Member;
  busy: boolean;
  offline: boolean;
  onClose: () => void;
  onChangeRole: (role: Role) => void;
  onKick: () => void;
}) {
  const nextRole: Role = member.role === "owner" ? "member" : "owner";
  const isOwner = member.role === "owner";

  return (
    <Sheet visible onClose={busy ? () => {} : onClose}>
      <View className="gap-1">
        <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
          {member.nickname}
        </Text>
        <Text className="font-sans text-base text-muted dark:text-silver">
          {isOwner
            ? "Owners can invite people, change roles, and archive the household."
            : "Members can add expenses and edit their own."}
        </Text>
      </View>

      {offline ? (
        <Text className="font-sans text-sm text-muted dark:text-silver">
          Changing roles needs a connection.
        </Text>
      ) : null}

      <View className="gap-2">
        <BrandButton
          fullWidth
          variant={isOwner ? "outlined" : "filled"}
          label={busy ? "Saving…" : isOwner ? "Make member" : "Make owner"}
          disabled={busy || offline}
          onPress={() => onChangeRole(nextRole)}
        />
        {!isOwner ? (
          <BrandButton
            fullWidth
            variant="destructive"
            label="Remove from household"
            disabled={busy || offline}
            onPress={onKick}
          />
        ) : null}
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
