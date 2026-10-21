import { Ionicons } from "@expo/vector-icons";
import { useQuery, useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { HouseholdRow } from "@/components/ui/HouseholdRow";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/lib/auth";
import { useTheme } from "@/theme/ThemeProvider";

const stamp = (d: Date) => d.toISOString().replace("T", " ");

const HOUSEHOLDS_SQL = `
  SELECT h.id, h.name, h.currency_code,
    (SELECT COUNT(*) FROM household_member mm
      WHERE mm.household_id = h.id AND mm.left_at IS NULL) AS members,
    (SELECT ROUND(SUM(CAST(e.amount AS REAL)), 2) FROM expense e
      WHERE e.household_id = h.id AND e.voided_at IS NULL
        AND datetime(e.spent_at) >= datetime(?) AND datetime(e.spent_at) < datetime(?)) AS month_total
  FROM household h
  JOIN household_member m ON m.household_id = h.id
  WHERE m.user_id = ? AND m.left_at IS NULL AND h.deleted_at IS NULL
  ORDER BY h.name`;

type Household = {
  id: string;
  name: string;
  currency_code: string;
  members: number;
  month_total: number | null;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMoney(total: number | null, currency: string) {
  const [whole, cents] = (total ?? 0).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${CURRENCY_SYMBOLS[currency] ?? `${currency} `}${grouped}.${cents}`;
}

export default function HouseholdsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const session = useSession();
  const { connected, hasSynced } = useStatus();

  const now = new Date();
  const monthStart = stamp(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = stamp(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const { data: households } = useQuery<Household>(HOUSEHOLDS_SQL, [
    monthStart,
    monthEnd,
    session?.user.id ?? "",
  ]);
  const offline = !connected;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <View className="flex-row items-center justify-between px-6 pt-2">
        <AppLogo />
        <ThemeToggle />
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="font-sans-bold text-3xl text-graphite dark:text-on-graphite">
          Your households
        </Text>

        {households.length === 0 ? (
          hasSynced ? (
            <View className="flex-1 items-center justify-center gap-3 px-8">
              <View className="h-14 w-14 items-center justify-center rounded-3xl bg-selected dark:bg-selected-dark">
                <Ionicons name="home-outline" size={28} color={colors.mint} />
              </View>
              <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
                No households yet
              </Text>
              <Text className="text-center font-sans text-base text-muted dark:text-silver">
                Create one or join with a code to get started.
              </Text>
            </View>
          ) : null
        ) : (
          <View className="mt-3 gap-3">
            {households.map((household) => (
              <HouseholdRow
                key={household.id}
                name={household.name}
                members={household.members}
                month={MONTHS[now.getMonth()]}
                total={formatMoney(
                  household.month_total,
                  household.currency_code,
                )}
                onPress={() =>
                  router.navigate({
                    pathname: "/household/[id]",
                    params: { id: household.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-2 px-6 pb-4">
        {offline ? (
          <Text className="text-center font-sans text-lg text-muted dark:text-silver">
            Creating or joining a household needs a connection.
          </Text>
        ) : null}
        <BrandButton
          fullWidth
          label="Create household"
          disabled={offline}
          onPress={() => router.navigate("/household/create")}
        />
        <BrandButton
          variant="text"
          label="Join with invite code"
          disabled={offline}
          onPress={() => router.navigate("/household/join")}
        />
      </View>
    </SafeAreaView>
  );
}
