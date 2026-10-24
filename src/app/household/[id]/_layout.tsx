import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";

import { BottomTabBar } from "@/features/household/components/BottomTabBar";
import { HouseholdProvider } from "@/features/household/HouseholdProvider";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return (
    <HouseholdProvider id={id}>
      <Tabs
        tabBar={(props) => (
          <BottomTabBar
            {...props}
            onAddExpense={() =>
              router.push({ pathname: "/expense/new", params: { id } })
            }
          />
        )}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "Expenses",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="summary"
          options={{
            title: "Summary",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "pie-chart" : "pie-chart-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </HouseholdProvider>
  );
}
