const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const MONTHS = [
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

export function formatMoney(total: number | null, currency: string) {
  const [whole, cents] = (total ?? 0).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${CURRENCY_SYMBOLS[currency] ?? `${currency} `}${grouped}.${cents}`;
}

const stamp = (date: Date) => date.toISOString().replace("T", " ");

export function monthBounds(date: Date) {
  return {
    monthStart: stamp(new Date(date.getFullYear(), date.getMonth(), 1)),
    monthEnd: stamp(new Date(date.getFullYear(), date.getMonth() + 1, 1)),
  };
}
