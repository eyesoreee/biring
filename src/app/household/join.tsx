import { useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/lib/auth";
import { rpc } from "@/powersync/rpc";

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const session = useSession();
  const { connected } = useStatus();
  const [nickname, setNickname] = useState(
    () => session?.user.email?.split("@")[0] ?? "",
  );
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedCode = code.trim();
  const trimmedNickname = nickname.trim();
  const offline = !connected;
  const canJoin = !!trimmedNickname && !!trimmedCode && !submitting && !offline;

  const handleJoin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const id = await rpc<string>("join_household", {
        p_code: trimmedCode,
        p_nickname: trimmedNickname,
      });
      router.replace({ pathname: "/household/[id]", params: { id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-6 px-6 pb-4 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row">
          <BackButton onPress={() => router.back()} />
        </View>

        <View className="gap-2">
          <Text className="font-sans-bold text-4xl text-graphite dark:text-on-graphite">
            Join your family.
          </Text>
          <Text className="font-sans text-lg text-muted dark:text-silver">
            Ask the household owner for their invite code — they&apos;ll find it
            in Settings.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Nickname
          </Text>
          <TextField
            value={nickname}
            onChangeText={setNickname}
            placeholder="How they'll see you"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={24}
            returnKeyType="next"
          />
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Invite code
          </Text>
          <TextField
            value={code}
            onChangeText={setCode}
            placeholder="Paste the invite code"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={32}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />
        </View>

        <View className="flex-1" />

        {error ? (
          <Text className="text-center font-sans text-lg text-destructive">
            {error}
          </Text>
        ) : null}

        {offline ? (
          <Text className="text-center font-sans text-lg text-muted dark:text-silver">
            Joining a household needs a connection.
          </Text>
        ) : null}

        <BrandButton
          fullWidth
          label={submitting ? "Joining…" : "Join household"}
          disabled={!canJoin}
          onPress={handleJoin}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
