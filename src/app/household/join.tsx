import { useStatus } from "@powersync/react";
import { parse } from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { BrandButton } from "@/components/ui/BrandButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextField } from "@/components/ui/TextField";
import { QrScanner } from "@/features/household/components/QrScanner";
import { useSession } from "@/lib/auth";
import { validate, type FieldErrors } from "@/lib/forms";
import { rpc } from "@/powersync/rpc";

const joinSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Add a nickname")
    .max(24, "Keep the nickname under 24 characters"),
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[0-9a-f]{32}$/, "Enter the 32-character invite code"),
});

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const { code: inviteCode } = useLocalSearchParams<{ code?: string }>();
  const session = useSession();
  const { connected } = useStatus();
  const [nickname, setNickname] = useState(
    () => session?.user.email?.split("@")[0] ?? "",
  );
  const [code, setCode] = useState(() =>
    typeof inviteCode === "string" ? inviteCode : "",
  );
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const offline = !connected;

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleScan = (data: string) => {
    const scanned = parse(data).queryParams?.code;
    setCode(typeof scanned === "string" ? scanned : data.trim());
    clearError("code");
    setScanning(false);
  };

  const handleJoin = async () => {
    setError(null);

    const result = validate(joinSchema, { nickname, code });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const id = await rpc<string>("join_household", {
        p_code: result.data.code,
        p_nickname: result.data.nickname,
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
        <PageHeader
          back={() => router.back()}
          title="Join your family."
          subtitle="Ask the household owner for their invite code — they'll find it in Settings."
        />

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Nickname
          </Text>
          <TextField
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              clearError("nickname");
            }}
            error={errors.nickname}
            accessibilityLabel="Nickname"
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
            onChangeText={(value) => {
              setCode(value);
              clearError("code");
            }}
            error={errors.code}
            accessibilityLabel="Invite code"
            placeholder="Paste the invite code"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={32}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />
          <BrandButton
            fullWidth
            variant="outlined"
            label="Scan QR code"
            onPress={() => setScanning(true)}
          />
        </View>

        <View className="flex-1" />

        {error ? (
          <Text className="text-center font-sans text-lg text-destructive-ink dark:text-destructive">
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
          disabled={submitting || offline}
          onPress={handleJoin}
        />
      </ScrollView>

      {scanning ? (
        <QrScanner onClose={() => setScanning(false)} onScan={handleScan} />
      ) : null}
    </SafeAreaView>
  );
}
