import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { TextField } from "@/components/ui/TextField";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/theme/ThemeProvider";

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
  const { colors } = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const copy = COPY[mode];

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }, [router]);

  const toggleMode = useCallback(() => {
    setMode((current) => (current === "signin" ? "signup" : "signin"));
  }, []);

  const handleSubmit = useCallback(() => {}, []);

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
          <Pressable
            onPress={handleBack}
            className="active:opacity-60 h-10 w-10 items-center justify-center rounded-full border border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
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
          />
        </View>

        <View className="items-center gap-2">
          <BrandButton fullWidth label={copy.cta} onPress={handleSubmit} />
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
