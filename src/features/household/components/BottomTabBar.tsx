import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

const BAR_HEIGHT = 64;
const FAB_SIZE = 52;
const NOTCH_WIDTH = 48;

type Props = BottomTabBarProps & {
  onAddExpense: () => void;
};

export function BottomTabBar({
  state,
  descriptors,
  navigation,
  insets,
  onAddExpense,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row border-t border-edge bg-surface dark:border-graphite-border dark:bg-graphite-surface"
      style={{
        height: BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? colors.mint : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Fragment key={route.key}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              className="flex-1 items-center justify-center gap-1"
            >
              {options.tabBarIcon?.({ focused, color, size: 22 })}
              <Text
                className={`font-sans-medium text-[11px] ${focused ? "text-mint" : "text-muted dark:text-silver"}`}
              >
                {options.title}
              </Text>
            </Pressable>
            {index === 1 ? <View style={{ width: NOTCH_WIDTH }} /> : null}
          </Fragment>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        onPress={onAddExpense}
        className="active:opacity-90 absolute items-center justify-center rounded-full bg-mint"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderRadius: FAB_SIZE / 2,
          left: "50%",
          marginLeft: -FAB_SIZE / 2,
          bottom: insets.bottom + BAR_HEIGHT / 2,
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={30} color={colors.onMint} />
      </Pressable>
    </View>
  );
}
