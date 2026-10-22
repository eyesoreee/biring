import { Ionicons } from "@expo/vector-icons";
import { useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { TextField } from "@/components/ui/TextField";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useHousehold } from "@/lib/household";
import { rpc } from "@/powersync/rpc";
import { logout, powersync } from "@/powersync/system";
import { useTheme } from "@/theme/ThemeProvider";

const alertError = (title: string, cause: unknown) =>
  Alert.alert(
    title,
    cause instanceof Error ? cause.message : "Please try again.",
  );

function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="height" className="flex-1">
        <Pressable
          onPress={onClose}
          className="flex-1 justify-center bg-black/50 px-6"
        >
          <Pressable
            onPress={() => {}}
            className="gap-4 rounded-2xl border border-edge bg-surface p-5 dark:border-graphite-border dark:bg-graphite"
          >
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { id, household, members, me } = useHousehold();
  const router = useRouter();
  const { colors } = useTheme();
  const { connected } = useStatus();
  const canArchive = me?.role === "owner" && members.length === 1;
  const offline = !connected;

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState(false);

  const openNickname = () => {
    if (!me) return;
    setDraft(me.nickname);
    setEditing(true);
  };

  const saveNickname = async () => {
    const nickname = draft.trim();
    if (!nickname || !me) return;
    try {
      await powersync.execute(
        "UPDATE household_member SET nickname = ? WHERE id = ?",
        [nickname, me.id],
      );
      setEditing(false);
    } catch (cause) {
      alertError("Can't save nickname", cause);
    }
  };

  const shareInvite = () => {
    if (!household) return;
    Share.share({
      message: `Join ${household.name} on biring with this invite code: ${household.invite_code}`,
    }).catch(() => {});
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
      router.replace("/auth");
    } catch (cause) {
      alertError("Can't log out", cause);
    } finally {
      setBusy(false);
    }
  };

  const archive = () => {
    Alert.alert(
      "Archive household?",
      "It disappears from your list and can't be restored in the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await rpc("archive_household", { p_household_id: id });
              router.navigate("/");
            } catch (cause) {
              alertError("Can't archive household", cause);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas dark:bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          <View className="flex-row">
            <BackButton onPress={() => router.navigate("/")} />
          </View>
          <Text className="font-sans-bold text-4xl text-graphite dark:text-on-graphite">
            Settings
          </Text>
        </View>

        <View className="gap-3">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Family members
          </Text>
          <View className="overflow-hidden rounded-2xl border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface">
            {members.map((member) => {
              const isMe = member.id === me?.id;
              return (
                <View
                  key={member.id}
                  className="flex-row items-center gap-3 border-b border-edge px-4 py-3 dark:border-graphite-border"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-selected dark:bg-selected-dark">
                    <Text className="font-sans-semibold text-base text-mint">
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
                      onPress={openNickname}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Change nickname"
                      className="active:opacity-60 h-10 w-10 items-center justify-center"
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={18}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}

            <Pressable
              onPress={() => setInviting(true)}
              className="active:opacity-70 flex-row items-center gap-3 px-4 py-3"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full border border-dashed border-mint">
                <Ionicons name="add" size={20} color={colors.mint} />
              </View>
              <Text className="font-sans-semibold text-lg text-mint">
                Invite a family member
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Household
          </Text>
          <View className="overflow-hidden rounded-2xl border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface">
            <View className="flex-row items-center justify-between gap-4 border-b border-edge px-4 py-4 dark:border-graphite-border">
              <Text className="font-sans text-base text-muted dark:text-silver">
                Name
              </Text>
              <Text
                numberOfLines={1}
                className="flex-1 text-right font-sans text-lg text-graphite dark:text-on-graphite"
              >
                {household?.name ?? "—"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between gap-4 px-4 py-4">
              <Text className="font-sans text-base text-muted dark:text-silver">
                Currency
              </Text>
              <Text className="font-sans text-lg text-graphite dark:text-on-graphite">
                {household?.currency_code ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Preferences
          </Text>
          <View className="flex-row items-center justify-between rounded-2xl border border-edge bg-surface px-4 py-3 dark:border-graphite-border dark:bg-graphite-surface">
            <Text className="font-sans text-lg text-graphite dark:text-on-graphite">
              Dark mode
            </Text>
            <ThemeToggle />
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Account
          </Text>
          {offline ? (
            <Text className="font-sans text-sm text-muted dark:text-silver">
              Signing out and archiving need a connection.
            </Text>
          ) : null}
          <BrandButton
            fullWidth
            variant="outlined"
            label="Sign out"
            disabled={busy || offline}
            onPress={signOut}
          />
          {me?.role === "owner" ? (
            <BrandButton
              fullWidth
              variant="destructive"
              label="Archive household"
              disabled={busy || offline || !canArchive}
              onPress={archive}
            />
          ) : null}
          {me?.role === "owner" && !canArchive ? (
            <Text className="font-sans text-sm text-muted dark:text-silver">
              Archiving is available when you&apos;re the only member.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <Sheet visible={editing} onClose={() => setEditing(false)}>
        <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
          Change nickname
        </Text>
        <TextField
          value={draft}
          onChangeText={setDraft}
          placeholder="How they'll see you"
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={24}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={saveNickname}
        />
        <View className="flex-row justify-end gap-2">
          <BrandButton
            variant="text"
            label="Cancel"
            onPress={() => setEditing(false)}
          />
          <BrandButton
            label="Save"
            disabled={!draft.trim()}
            onPress={saveNickname}
          />
        </View>
      </Sheet>

      <Sheet visible={inviting} onClose={() => setInviting(false)}>
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
          <BrandButton
            variant="text"
            label="Close"
            onPress={() => setInviting(false)}
          />
          <BrandButton
            label="Share"
            disabled={!household}
            onPress={shareInvite}
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
