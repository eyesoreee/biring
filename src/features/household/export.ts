import { Directory, File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";

import { powersync } from "@/powersync/system";

import { parseSpentAt } from "./format";
import { EXPORT_EXPENSES_SQL } from "./sql";

type ExportRow = {
  spent_at: string;
  title: string;
  category: string;
  amount: string;
  note: string | null;
  voided_at: string | null;
  voided_reason: string | null;
  spender_nickname: string | null;
};

const COLUMNS = [
  "Date",
  "Title",
  "Category",
  "Amount",
  "Currency",
  "Paid by",
  "Note",
  "Voided",
  "Void reason",
];

function escapeCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function localIsoDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function expensesToCsv(rows: ExportRow[], currency: string) {
  const lines = [COLUMNS.join(",")];

  for (const row of rows) {
    lines.push(
      [
        localIsoDate(parseSpentAt(row.spent_at)),
        row.title,
        row.category,
        row.amount,
        currency,
        row.spender_nickname ?? "",
        row.note ?? "",
        row.voided_at ? "TRUE" : "FALSE",
        row.voided_reason ?? "",
      ]
        .map(escapeCell)
        .join(","),
    );
  }

  // BOM so Excel reads UTF-8; CRLF per RFC 4180.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function exportFileName(householdName: string) {
  const slug =
    householdName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "household";
  return `biring-${slug}-${localIsoDate(new Date())}.csv`;
}

async function buildExpensesCsv(
  householdId: string,
  householdName: string,
  currency: string,
) {
  const rows = await powersync.getAll<ExportRow>(EXPORT_EXPENSES_SQL, [
    householdId,
  ]);
  if (rows.length === 0) return null;
  return expensesToCsv(rows, currency);
}

/** Opens the folder picker and writes the CSV into the chosen folder. */
export async function saveExpensesCsv(
  householdId: string,
  householdName: string,
  currency: string,
) {
  const csv = await buildExpensesCsv(householdId, householdName, currency);
  if (csv === null) return "empty" as const;

  let directory: Directory;
  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (cause) {
    if ((cause as { code?: string }).code === "ERR_PICKER_CANCELLED") {
      return "cancelled" as const;
    }
    throw cause;
  }

  const file = directory.createFile(exportFileName(householdName), "text/csv");
  file.write(csv);
  return "saved" as const;
}

/** Writes the CSV to the cache directory and opens the share sheet. */
export async function shareExpensesCsv(
  householdId: string,
  householdName: string,
  currency: string,
) {
  const csv = await buildExpensesCsv(householdId, householdName, currency);
  if (csv === null) return false;

  const file = new File(Paths.cache, exportFileName(householdName));
  file.create({ overwrite: true });
  file.write(csv);
  await shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Export expenses",
  });
  return true;
}
