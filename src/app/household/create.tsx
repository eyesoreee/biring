import { Ionicons } from "@expo/vector-icons";
import { useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { StepProgress } from "@/components/ui/StepProgress";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/lib/auth";
import { validate, type FieldErrors } from "@/lib/forms";
import { rpc } from "@/powersync/rpc";
import { useTheme } from "@/theme/ThemeProvider";

const CURRENCIES = ["PHP", "USD", "EUR", "GBP", "JPY"];

const householdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give your household a name")
    .max(32, "Keep the name under 32 characters"),
  nickname: z
    .string()
    .trim()
    .min(1, "Add a nickname")
    .max(24, "Keep the nickname under 24 characters"),
  currency: z.string().min(1, "Pick a currency"),
});

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const session = useSession();
  const { connected } = useStatus();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState(
    () => session?.user.email?.split("@")[0] ?? "",
  );
  const [currency, setCurrency] = useState("PHP");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedNickname = nickname.trim();
  const completed = [trimmedNickname, currency, trimmedName].filter(
    Boolean,
  ).length;
  const offline = !connected;

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleCreate = async () => {
    setError(null);

    const result = validate(householdSchema, { name, nickname, currency });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const id = await rpc<string>("create_household", {
        p_name: result.data.name,
        p_nickname: result.data.nickname,
        p_currency: result.data.currency,
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

        <StepProgress completed={completed} total={3} />

        <View className="gap-2">
          <Text className="font-sans-bold text-3xl text-graphite dark:text-on-graphite">
            Make it yours.
          </Text>
          <Text className="font-sans text-lg text-muted dark:text-silver">
            Give it a name and a currency. You can&apos;t change them later.
          </Text>
        </View>

        <View className="flex-row items-center gap-4 rounded-2xl border border-edge bg-surface p-4 dark:border-graphite-border dark:bg-graphite-surface">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-selected dark:bg-selected-dark">
            <Ionicons name="home" size={24} color={colors.mint} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text
              numberOfLines={1}
              className="font-sans-semibold text-lg text-graphite dark:text-on-graphite"
            >
              {trimmedName || "Your household"}
            </Text>
            <Text className="font-sans text-sm text-muted dark:text-silver">
              {currency} · You, as owner
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Household name
          </Text>
          <TextField
            value={name}
            onChangeText={(value) => {
              setName(value);
              clearError("name");
            }}
            error={errors.name}
            accessibilityLabel="Household name"
            placeholder="Home"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={32}
            returnKeyType="next"
          />
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Your nickname
          </Text>
          <TextField
            value={nickname}
            onChangeText={(value) => {
              setNickname(value);
              clearError("nickname");
            }}
            error={errors.nickname}
            accessibilityLabel="Your nickname"
            placeholder="How they'll see you"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium text-sm text-muted dark:text-silver">
            Currency
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CURRENCIES.map((code) => {
              const selected = code === currency;
              return (
                <Pressable
                  key={code}
                  onPress={() => setCurrency(code)}
                  hitSlop={{ top: 5, bottom: 5 }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`rounded-full border px-4 py-2 ${
                    selected
                      ? "border-mint-ink bg-selected dark:border-mint dark:bg-selected-dark"
                      : "border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
                  }`}
                >
                  <Text
                    className={`font-sans-medium text-base ${
                      selected
                        ? "text-mint-ink dark:text-mint"
                        : "text-muted dark:text-silver"
                    }`}
                  >
                    {code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-1" />

        {error ? (
          <Text className="text-center font-sans text-lg text-destructive-ink dark:text-destructive">
            {error}
          </Text>
        ) : null}

        {offline ? (
          <Text className="text-center font-sans text-lg text-muted dark:text-silver">
            Creating a household needs a connection.
          </Text>
        ) : null}

        <BrandButton
          fullWidth
          label={submitting ? "Creating…" : "Create household"}
          disabled={submitting || offline}
          onPress={handleCreate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
