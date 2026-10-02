import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import exceljs from "exceljs";

const { Workbook } = exceljs;

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = resolve(
  rootDir,
  process.argv[2] ?? "data-source/tarot-data.xlsx.xlsx",
);
const outputPath = resolve(
  rootDir,
  process.argv[3] ?? "src/assets/data/tarot.json",
);

// 第 1 列是中文標題，第 2 列是欄位鍵，第 3 列起是牌資料
const HEADER_ROW = 2;
const FIRST_DATA_ROW = 3;

function readOwned(value: object, key: string): unknown {
  if (!Object.hasOwn(value, key)) {
    return undefined;
  }

  return Reflect.get(value, key);
}

function readRichText(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const text = value
    .map((part: unknown) => {
      if (typeof part !== "object" || part === null) {
        return "";
      }

      const textPart = readOwned(part, "text");
      return typeof textPart === "string" ? textPart : "";
    })
    .join("")
    .trim();

  return text.length > 0 ? text : null;
}

function readCell(value: unknown): string | number | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim();
    return text.length > 0 ? text : null;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (Object.hasOwn(value, "richText")) {
      return readRichText(readOwned(value, "richText"));
    }

    if (Object.hasOwn(value, "result")) {
      return readCell(readOwned(value, "result"));
    }

    const text = readOwned(value, "text");
    if (typeof text === "string") {
      const trimmed = text.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }

  return null;
}

async function convertTarotWorkbook(): Promise<void> {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(inputPath);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("工作簿沒有工作表");
  }

  const fields: Array<{ column: number; key: string }> = [];

  sheet.getRow(HEADER_ROW).eachCell({ includeEmpty: false }, (cell, column) => {
    const key = readCell(cell.value);
    if (typeof key === "string") {
      fields.push({ column, key });
    }
  });

  const fieldKeys = new Set(fields.map((field) => field.key));
  for (const required of ["cardId", "cardName", "cardUrl"]) {
    if (!fieldKeys.has(required)) {
      throw new Error(`第 ${HEADER_ROW} 列缺少欄位鍵：${required}`);
    }
  }

  const cards: Array<Record<string, string | number>> = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < FIRST_DATA_ROW) {
      return;
    }

    const record: Record<string, string | number> = {};
    let hasCardId = false;

    for (const field of fields) {
      const parsed = readCell(row.getCell(field.column).value);

      if (field.key === "cardId") {
        if (typeof parsed !== "number") {
          return;
        }
        record.cardId = parsed;
        hasCardId = true;
        continue;
      }

      record[field.key] = typeof parsed === "number" ? parsed : (parsed ?? "");
    }

    if (!hasCardId) {
      return;
    }

    if (typeof record.cardUrl !== "string" || record.cardUrl.length === 0) {
      throw new Error(
        `第 ${rowNumber} 列缺少 cardUrl（cardId: ${record.cardId}）`,
      );
    }

    cards.push(record);
  });

  if (cards.length === 0) {
    throw new Error("沒有讀到任何塔羅牌資料");
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
  console.log(`已寫入 ${cards.length} 筆到 ${outputPath}`);
}

convertTarotWorkbook().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
