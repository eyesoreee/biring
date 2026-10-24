import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackButton } from "@/components/ui/BackButton";
import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import {
  addExpense,
  isValidAmount,
  normalizeAmountInput,
} from "@/features/household/expenses";
import { currencySymbol, formatExpenseDate } from "@/features/household/format";
import { useHousehold } from "@/features/household/HouseholdProvider";
import { useTheme } from "@/theme/ThemeProvider";

export function AddExpenseForm() {
  const router = useRouter();
  const { colors, scheme } = useTheme();
  const { id, household, me } = useHousehold();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date());
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = household?.currency_code ?? "PHP";
  const amountValid = isValidAmount(amount);
  const canSave =
    amountValid && !!category.trim() && !!title.trim() && !!me && !saving;
  const missingRequired = !amountValid || !category.trim() || !title.trim();
  const showAmountError = !!amount && !amountValid && !amountFocused;
  const formattedDate = formatExpenseDate(date);

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/household/[id]", params: { id } });
    }
  };

  const handleSave = async () => {
    if (!canSave || !me) return;

    Keyboard.dismiss();
    setError(null);
    setSaving(true);
    try {
      await addExpense(id, me.user_id, {
        title,
        amount,
        category,
        note,
        spentAt: date,
      });
      close();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't save this expense",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow gap-6 px-6 pb-6 pt-2"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row">
            <BackButton onPress={close} />
          </View>

          <View className="gap-2">
            <Text className="font-sans-bold text-4xl text-graphite dark:text-on-graphite">
              Add expense
            </Text>
            <Text className="font-sans text-lg text-muted dark:text-silver">
              Log what you spent. It saves offline and syncs later.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted dark:text-silver">
              Amount
            </Text>
            <View
              className={`flex-row items-center gap-3 rounded-2xl border bg-surface px-4 py-4 dark:bg-graphite-surface ${
                amountFocused
                  ? "border-mint"
                  : "border-edge dark:border-graphite-border"
              }`}
            >
              <Text className="font-sans-semibold text-3xl text-muted dark:text-silver">
                {currencySymbol(currency)}
              </Text>
              <TextInput
                autoFocus
                accessibilityLabel={`Amount in ${currency}`}
                className="flex-1 py-0 font-sans-bold text-4xl text-graphite placeholder:text-placeholder dark:text-on-graphite"
                inputMode="decimal"
                keyboardType="decimal-pad"
                maxLength={12}
                onBlur={() => setAmountFocused(false)}
                onChangeText={(value) => setAmount(normalizeAmountInput(value))}
                onFocus={() => setAmountFocused(true)}
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                value={amount}
              />
              <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                {currency}
              </Text>
            </View>
            {showAmountError ? (
              <Text className="font-sans text-sm text-destructive">
                Enter an amount greater than zero, with up to two decimals.
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              Category
            </Text>
            <TextField
              autoCapitalize="words"
              maxLength={40}
              onChangeText={setCategory}
              placeholder="Food, bills, transport…"
              returnKeyType="next"
              value={category}
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              Date
            </Text>
            <Pressable
              accessibilityHint="Opens the date picker"
              accessibilityLabel={`Date, ${formattedDate}`}
              accessibilityRole="button"
              className="active:opacity-70 h-14 flex-row items-center gap-3 rounded-2xl border border-edge bg-surface px-4 dark:border-graphite-border dark:bg-graphite-surface"
              onPress={() => {
                Keyboard.dismiss();
                setShowDatePicker(true);
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text className="flex-1 font-sans text-lg text-graphite dark:text-on-graphite">
                {formattedDate}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              Title
            </Text>
            <TextField
              autoCapitalize="sentences"
              maxLength={80}
              onChangeText={setTitle}
              placeholder="What was it for?"
              returnKeyType="next"
              value={title}
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-medium text-sm text-muted dark:text-silver">
                Note
              </Text>
              <Text className="font-sans text-xs text-muted dark:text-silver">
                Optional
              </Text>
            </View>
            <TextInput
              className={`min-h-[112px] rounded-2xl border bg-surface px-4 py-3 font-sans text-lg text-graphite placeholder:text-placeholder dark:bg-graphite-surface dark:text-on-graphite ${
                noteFocused
                  ? "border-mint"
                  : "border-edge dark:border-graphite-border"
              }`}
              maxLength={300}
              multiline
              onBlur={() => setNoteFocused(false)}
              onChangeText={setNote}
              onFocus={() => setNoteFocused(true)}
              placeholder="Anything to remember?"
              placeholderTextColor={colors.placeholder}
              textAlignVertical="top"
              value={note}
            />
          </View>

          <View className="flex-1" />

          {error ? (
            <Text className="text-center font-sans text-base text-destructive">
              {error}
            </Text>
          ) : null}

          {missingRequired ? (
            <Text className="text-center font-sans text-sm text-muted dark:text-silver">
              Add an amount, category, and title to save.
            </Text>
          ) : null}

          <View className="gap-2">
            <BrandButton
              disabled={!canSave}
              fullWidth
              label={saving ? "Saving…" : "Save expense"}
              onPress={handleSave}
            />
            <Text className="text-center font-sans text-sm text-muted dark:text-silver">
              Saves on this device and syncs when you&apos;re online.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && showDatePicker ? (
        <Sheet visible onClose={() => setShowDatePicker(false)}>
          <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
            Choose a date
          </Text>
          <DateTimePicker
            accentColor={colors.mint}
            display="inline"
            maximumDate={new Date()}
            mode="date"
            onValueChange={(_event, selected) => setDate(selected)}
            themeVariant={scheme}
            value={date}
          />
          <BrandButton
            fullWidth
            label="Done"
            onPress={() => setShowDatePicker(false)}
          />
        </Sheet>
      ) : null}

      {Platform.OS === "android" && showDatePicker ? (
        <DateTimePicker
          accentColor={colors.mint}
          maximumDate={new Date()}
          mode="date"
          negativeButton={{ label: "Cancel" }}
          onDismiss={() => setShowDatePicker(false)}
          onValueChange={(_event, selected) => {
            setDate(selected);
            setShowDatePicker(false);
          }}
          positiveButton={{ label: "Set" }}
          presentation="dialog"
          value={date}
        />
      ) : null}
    </SafeAreaView>
  );
}
