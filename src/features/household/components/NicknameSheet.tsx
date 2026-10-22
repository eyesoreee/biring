import { Text, View } from "react-native";

import { BrandButton } from "@/components/ui/BrandButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";

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
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
        Change nickname
      </Text>
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder="How they'll see you"
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onSave}
      />
      <View className="flex-row justify-end gap-2">
        <BrandButton variant="text" label="Cancel" onPress={onClose} />
        <BrandButton label="Save" disabled={!value.trim()} onPress={onSave} />
      </View>
    </Sheet>
  );
}
