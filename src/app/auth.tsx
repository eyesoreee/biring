import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { TextField } from "@/components/ui/TextField";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

const COPY: Record<
  AuthMode,
  { title: string; subtitle: string; cta: string; toggle: string }
> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to open your household's ledger.",
    cta: "Sign in",
    toggle: "New here? Create an account",
  },
  signup: {
    title: "Create your account",
    subtitle: "Set up an account to start a household or join with a code.",
    cta: "Create account",
    toggle: "Already have an account? Sign in",
  },
};

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = COPY[mode];

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/onboarding");
  }, [router]);

  const toggleMode = useCallback(() => {
    setError(null);
    setMode((current) => (current === "signin" ? "signup" : "signin"));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const credentials = { email: email.trim(), password };
      const { data, error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(credentials)
          : await supabase.auth.signUp(credentials);
      if (error) throw error;
      if (!data.session)
        throw new Error(
          "Email confirmation is enabled in Supabase — turn it off to sign up without confirming.",
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-5 px-6 pb-4 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <BackButton onPress={handleBack} />
          <ThemeToggle />
        </View>

        <View className="mt-4 items-center gap-5">
          <AppLogo size={64} showWordmark={false} />
          <Text className="text-center font-sans-bold text-4xl leading-6 text-graphite dark:text-on-graphite">
            {copy.title}
          </Text>
          <Text className="text-center font-sans text-lg leading-6 text-muted dark:text-silver">
            {copy.subtitle}
          </Text>
        </View>

        <View className="mt-2 gap-3">
          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
          />
          <TextField
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === "signin" ? "password" : "new-password"}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        {error ? (
          <Text className="text-center font-sans text-lg text-destructive">
            {error}
          </Text>
        ) : null}

        <View className="items-center gap-2">
          <BrandButton
            fullWidth
            label={loading ? "One moment…" : copy.cta}
            disabled={loading}
            onPress={handleSubmit}
          />
          <BrandButton
            variant="text"
            label={copy.toggle}
            onPress={toggleMode}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
