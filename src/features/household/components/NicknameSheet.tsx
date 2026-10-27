import { useState } from "react";
import { Text, View } from "react-native";
import { z } from "zod";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { validate } from "@/lib/forms";

const nicknameSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Add a nickname")
    .max(24, "Keep the nickname under 24 characters"),
});

export function NicknameSheet({
  visible,
  value,
  onChangeText,
  onClose,
  onSave,
}: {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const result = validate(nicknameSchema, { nickname: value });
    if (!result.ok) {
      setError(result.errors.nickname);
      return;
    }

    setError(null);
    onSave();
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        setError(null);
        onClose();
      }}
    >
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Change nickname
      </Text>
      <TextField
        value={value}
        onChangeText={(next) => {
          onChangeText(next);
          setError(null);
        }}
        error={error ?? undefined}
        accessibilityLabel="Nickname"
        placeholder="How they'll see you"
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={save}
      />
      <View className="flex-row justify-end gap-2">
        <BrandButton variant="text" label="Cancel" onPress={onClose} />
        <BrandButton label="Save" onPress={save} />
      </View>
    </Sheet>
  );
}
