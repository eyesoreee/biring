import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Pressable } from "react-native";

export function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="height" className="flex-1">
        <Pressable
          onPress={onClose}
          className="flex-1 justify-center bg-black/50 px-6"
        >
          <Pressable
            onPress={() => {}}
            className="gap-4 rounded-2xl border border-edge bg-surface p-5 dark:border-graphite-border dark:bg-graphite"
          >
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
