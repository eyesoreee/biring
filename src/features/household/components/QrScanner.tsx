import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { openSettings } from "expo-linking";
import { useRef } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandButton } from "@/components/ui/BrandButton";

export function QrScanner({
  onClose,
  onScan,
}: {
  onClose: () => void;
  onScan: (data: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-graphite">
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              if (handled.current) return;
              handled.current = true;
              onScan(data);
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="text-center font-sans text-lg text-on-graphite">
              Camera access is needed to scan an invite code.
            </Text>
            <BrandButton
              label={
                permission?.canAskAgain === false
                  ? "Open settings"
                  : "Allow camera"
              }
              onPress={
                permission?.canAskAgain === false
                  ? openSettings
                  : requestPermission
              }
            />
          </View>
        )}

        {permission?.granted ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center gap-6"
          >
            <View className="h-64 w-64 rounded-2xl border-2 border-mint" />
            <Text className="font-sans text-base text-on-graphite">
              Point at the household QR code
            </Text>
          </View>
        ) : null}

        <SafeAreaView
          edges={["top"]}
          className="absolute inset-x-0 top-0"
          pointerEvents="box-none"
        >
          <View className="flex-row justify-end px-4">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close scanner"
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full bg-black/50"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
