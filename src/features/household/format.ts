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

export function currencySymbol(currency: string) {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export function formatExpenseDate(date: Date) {
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

export function toSqlTimestamp(date: Date) {
  return date.toISOString().replace("T", " ");
}

export function fromSqlTimestamp(value: string) {
  return new Date(value.replace(" ", "T"));
}

export function monthBounds(date: Date) {
  return {
    monthStart: toSqlTimestamp(
      new Date(date.getFullYear(), date.getMonth(), 1),
    ),
    monthEnd: toSqlTimestamp(
      new Date(date.getFullYear(), date.getMonth() + 1, 1),
    ),
  };
}
