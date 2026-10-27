import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { AppLogo } from "@/components/ui/AppLogo";
import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { TextField } from "@/components/ui/TextField";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { friendlyAuthError, validate, type FieldErrors } from "@/lib/forms";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

const authSchema = (mode: AuthMode) =>
  z.object({
    email: z.email("Enter a valid email address"),
    password:
      mode === "signup"
        ? z.string().min(6, "Password must be at least 6 characters")
        : z.string().min(1, "Enter your password"),
  });

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const copy = COPY[mode];

  const clearError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/onboarding");
  }, [router]);

  const toggleMode = useCallback(() => {
    setError(null);
    setNotice(null);
    setErrors({});
    setMode((current) => (current === "signin" ? "signup" : "signin"));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setNotice(null);

    const result = validate(authSchema(mode), {
      email: email.trim(),
      password,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data, error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword(result.data)
          : await supabase.auth.signUp(result.data);
      if (error) throw error;
      if (!data.session) {
        setMode("signin");
        setNotice("Account created. Confirm your email, then sign in.");
      }
    } catch (cause) {
      setError(
        friendlyAuthError(
          cause instanceof Error ? cause.message : "Something went wrong",
        ),
      );
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

        <View className="flex-1 justify-center gap-5">
          <View className="items-center gap-5">
            <AppLogo size={64} showWordmark={false} />
            <Text className="text-center font-sans-bold text-4xl text-graphite dark:text-on-graphite">
              {copy.title}
            </Text>
            <Text className="text-center font-sans text-lg text-muted dark:text-silver">
              {copy.subtitle}
            </Text>
          </View>

          <View className="gap-3">
            <TextField
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearError("email");
              }}
              error={errors.email}
              accessibilityLabel="Email"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
            />
            <TextField
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError("password");
              }}
              error={errors.password}
              accessibilityLabel="Password"
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === "signin" ? "password" : "new-password"}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {notice ? (
            <Text className="text-center font-sans text-base text-muted dark:text-silver">
              {notice}
            </Text>
          ) : null}

          {error ? (
            <Text className="text-center font-sans text-lg text-destructive-ink dark:text-destructive">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
