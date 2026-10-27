import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import type { Member } from "../types";

export function MemberRow({
  member,
  isMe,
  onEditNickname,
  onManage,
}: {
  member: Member;
  isMe: boolean;
  onEditNickname: () => void;
  onManage?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-3 border-b border-edge px-4 py-3 dark:border-graphite-border">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-selected dark:bg-selected-dark">
        <Text className="font-sans-semibold text-base text-mint-ink dark:text-mint">
          {member.nickname.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-sans-semibold text-lg text-graphite dark:text-on-graphite"
        >
          {member.nickname}
          {isMe ? (
            <Text className="font-sans text-muted dark:text-silver">
              {" "}
              (you)
            </Text>
          ) : null}
        </Text>
        <Text className="font-sans text-sm text-muted dark:text-silver">
          {member.role === "owner" ? "Owner" : "Member"}
        </Text>
      </View>

      {isMe ? (
        <Pressable
          onPress={onEditNickname}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Change nickname"
          className="active:opacity-60 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="pencil-outline" size={18} color={colors.textMuted} />
        </Pressable>
      ) : onManage ? (
        <Pressable
          onPress={onManage}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Manage ${member.nickname}`}
          className="active:opacity-60 h-10 w-10 items-center justify-center"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
