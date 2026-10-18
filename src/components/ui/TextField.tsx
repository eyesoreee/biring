import { useState } from "react";
import { TextInput, type TextInputProps } from "react-native";

export function TextField({ onBlur, onFocus, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      className={`h-14 rounded-2xl border bg-surface px-4 font-sans text-lg text-graphite placeholder:text-placeholder dark:bg-graphite-surface dark:text-on-graphite ${
        focused ? "border-mint" : "border-edge dark:border-graphite-border"
      }`}
    />
  );
}
