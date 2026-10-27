import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

import { BrandButton } from "@/components/ui/BrandButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import {
  addExpense,
  editExpense,
  isValidAmount,
  normalizeAmountInput,
  voidExpense,
} from "@/features/household/expenses";
import {
  currencySymbol,
  formatExpenseDate,
  fromSqlTimestamp,
} from "@/features/household/format";
import { useHousehold } from "@/features/household/HouseholdProvider";
import type { EditableExpense } from "@/features/household/types";
import { useTheme } from "@/theme/ThemeProvider";

export function AddExpenseForm({ expense }: { expense?: EditableExpense }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { id, household, me } = useHousehold();
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [category, setCategory] = useState(expense?.category ?? "");
  const [date, setDate] = useState(() =>
    expense ? fromSqlTimestamp(expense.spent_at) : new Date(),
  );
  const [title, setTitle] = useState(expense?.title ?? "");
  const [note, setNote] = useState(expense?.note ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVoid, setShowVoid] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const currency = household?.currency_code ?? "PHP";
  const amountValid = isValidAmount(amount);
  const canSave =
    amountValid && !!category.trim() && !!title.trim() && !!me && !saving;
  const canVoid = !!expense && me?.role === "owner";
  const missingRequired = !amountValid || !category.trim() || !title.trim();
  const showAmountError = !!amount && !amountValid && !amountFocused;
  const formattedDate = formatExpenseDate(date);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: "/household/[id]", params: { id } });
  };

  const handleSave = async () => {
    if (!canSave || !me) return;

    Keyboard.dismiss();
    setError(null);
    setSaving(true);
    try {
      const input = { title, amount, category, note, spentAt: date };
      if (expense) await editExpense(expense.id, input);
      else await addExpense(id, me.user_id, input);
      close();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Couldn't save this expense",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVoid = async () => {
    if (!expense || !canVoid || voiding) return;

    Keyboard.dismiss();
    setVoiding(true);
    try {
      await voidExpense(expense.id, voidReason);
      setShowVoid(false);
      close();
    } catch (cause) {
      Alert.alert(
        "Can't void expense",
        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      setVoiding(false);
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
          <PageHeader
            back={close}
            title={expense ? "Edit expense" : "Add expense"}
            subtitle={
              expense
                ? "Update the details. It saves offline and syncs later."
                : "Log what you spent. It saves offline and syncs later."
            }
          />

          <View className="gap-2">
            <Text className="font-sans-medium text-xs uppercase tracking-widest text-muted dark:text-silver">
              Amount
            </Text>
            <View
              className={`flex-row items-center gap-3 rounded-2xl border bg-surface px-4 py-4 dark:bg-graphite-surface ${
                amountFocused
                  ? "border-mint-ink dark:border-mint"
                  : "border-edge dark:border-graphite-border"
              }`}
            >
              <Text className="font-sans-semibold text-3xl text-muted dark:text-silver">
                {currencySymbol(currency)}
              </Text>
              <TextInput
                autoFocus
                accessibilityLabel={`Amount in ${currency}`}
                className="flex-1 py-0 font-sans-bold text-4xl text-graphite dark:text-on-graphite"
                style={{ fontVariant: ["tabular-nums"] }}
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
              <Text className="font-sans text-sm text-destructive-ink dark:text-destructive">
                Enter an amount greater than zero, with up to two decimals.
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              Category
            </Text>
            <TextField
              accessibilityLabel="Category"
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
              accessibilityLabel="Title"
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
              accessibilityLabel="Note, optional"
              className={`min-h-[112px] rounded-2xl border bg-surface px-4 py-3 font-sans text-lg text-graphite dark:bg-graphite-surface dark:text-on-graphite ${
                noteFocused
                  ? "border-mint-ink dark:border-mint"
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
            <Text className="text-center font-sans text-base text-destructive-ink dark:text-destructive">
              {error}
            </Text>
          ) : null}

          {missingRequired && !showAmountError ? (
            <Text className="text-center font-sans text-sm text-muted dark:text-silver">
              Add an amount, category, and title to save.
            </Text>
          ) : null}

          <View className="gap-2">
            <BrandButton
              disabled={!canSave}
              fullWidth
              label={
                saving ? "Saving…" : expense ? "Save changes" : "Save expense"
              }
              onPress={handleSave}
            />
            {canVoid ? (
              <BrandButton
                disabled={saving || voiding}
                fullWidth
                label="Void expense"
                onPress={() => {
                  Keyboard.dismiss();
                  setShowVoid(true);
                }}
                variant="destructive"
              />
            ) : null}
            <Text className="text-center font-sans text-sm text-muted dark:text-silver">
              Saves on this device and syncs when you&apos;re online.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker ? (
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

      <Sheet
        visible={showVoid}
        onClose={() => {
          if (voiding) return;
          setShowVoid(false);
          setVoidReason("");
        }}
      >
        <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
          Void expense?
        </Text>
        <Text className="font-sans text-base text-muted dark:text-silver">
          This can&apos;t be undone.
        </Text>

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              Reason
            </Text>
            <Text className="font-sans text-xs text-muted dark:text-silver">
              Optional
            </Text>
          </View>
          <TextField
            accessibilityLabel="Void reason (optional)"
            onChangeText={setVoidReason}
            placeholder="Why are you voiding this?"
            value={voidReason}
          />
        </View>

        <View className="gap-2">
          <BrandButton
            disabled={voiding}
            fullWidth
            label={voiding ? "Voiding…" : "Void expense"}
            onPress={handleVoid}
            variant="destructive"
          />
          <BrandButton
            disabled={voiding}
            fullWidth
            label="Cancel"
            onPress={() => {
              setShowVoid(false);
              setVoidReason("");
            }}
            variant="text"
          />
        </View>
      </Sheet>
    </SafeAreaView>
  );
}
