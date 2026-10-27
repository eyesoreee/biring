import { Ionicons } from "@expo/vector-icons";
import { useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandButton } from "@/components/ui/BrandButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArchiveSheet } from "@/features/household/components/ArchiveSheet";
import { InviteSheet } from "@/features/household/components/InviteSheet";
import { MemberRow } from "@/features/household/components/MemberRow";
import { NicknameSheet } from "@/features/household/components/NicknameSheet";
import { useHousehold } from "@/features/household/HouseholdProvider";
import { rpc } from "@/powersync/rpc";
import { logout, powersync } from "@/powersync/system";
import { useTheme } from "@/theme/ThemeProvider";

const alertError = (title: string, cause: unknown) =>
  Alert.alert(
    title,
    cause instanceof Error ? cause.message : "Please try again.",
  );

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
  const [confirming, setConfirming] = useState(false);
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

  const archive = async () => {
    setBusy(true);
    try {
      await rpc("archive_household", { p_household_id: id });
      setConfirming(false);
      router.navigate("/");
    } catch (cause) {
      setConfirming(false);
      alertError("Can't archive household", cause);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas dark:bg-graphite">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader title="Settings" />

        <View className="gap-3">
          <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
            Family members
          </Text>
          <View className="overflow-hidden rounded-2xl border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isMe={member.id === me?.id}
                onEditNickname={openNickname}
              />
            ))}

            <Pressable
              onPress={() => setInviting(true)}
              accessibilityRole="button"
              className="active:opacity-70 flex-row items-center gap-3 px-4 py-3"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full border border-dashed border-mint-ink dark:border-mint">
                <Ionicons name="add" size={20} color={colors.mint} />
              </View>
              <Text className="font-sans-semibold text-lg text-mint-ink dark:text-mint">
                Invite a family member
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
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
          <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
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
          <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
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
              onPress={() => setConfirming(true)}
            />
          ) : null}
          {me?.role === "owner" && !canArchive ? (
            <Text className="font-sans text-sm text-muted dark:text-silver">
              Archiving is available when you&apos;re the only member.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <NicknameSheet
        visible={editing}
        value={draft}
        onChangeText={setDraft}
        onClose={() => setEditing(false)}
        onSave={saveNickname}
      />

      <InviteSheet
        visible={inviting}
        onClose={() => setInviting(false)}
        household={household}
      />

      <ArchiveSheet
        visible={confirming}
        name={household?.name}
        busy={busy}
        onClose={() => setConfirming(false)}
        onArchive={archive}
      />
    </SafeAreaView>
  );
}
