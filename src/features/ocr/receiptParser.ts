import { ExtractedReceiptData } from "@/types";

// ============================================================
// OCR Receipt Parser
// Uses Tesseract.js to extract text from receipt images
// then applies regex heuristics to parse vendor/date/amount
// ============================================================

// Dynamic import to avoid SSR issues
async function getTesseract() {
  const Tesseract = await import("tesseract.js");
  return Tesseract;
}

export async function extractTextFromImage(imageData: string | File | Blob): Promise<string> {
  const Tesseract = await getTesseract();
  const { data: { text } } = await Tesseract.recognize(imageData, "eng", {
    logger: () => {}, // suppress progress logs
  });
  return text;
}

export function parseReceiptText(rawText: string): Omit<ExtractedReceiptData, "rawText"> {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // --- Amount Extraction ---
  // Look for lines with "total", "amount", "grand total", etc.
  const amountPatterns = [
    /(?:grand\s+)?total[:\s]+(?:inr|rs\.?|₹|usd|\$|eur|€|gbp|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:amount\s+due|amount\s+payable)[:\s]+(?:inr|rs\.?|₹|usd|\$|eur|€|gbp|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:inr|rs\.?|₹|usd|\$|eur|€|gbp|£)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /([0-9,]+\.[0-9]{2})\s*(?:inr|rs\.?|₹|usd|\$|eur|€|gbp|£)/i,
  ];

  let amount: number | undefined;
  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      const parsed = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // Fallback: find the largest number in the text (likely the total)
  if (!amount) {
    const numbers = rawText.match(/[0-9,]+\.[0-9]{2}/g);
    if (numbers) {
      const parsed = numbers.map((n) => parseFloat(n.replace(/,/g, ""))).filter((n) => n > 0);
      if (parsed.length > 0) {
        amount = Math.max(...parsed);
      }
    }
  }

  // --- Date Extraction ---
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/i,
  ];

  let date: string | undefined;
  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      date = match[0];
      break;
    }
  }

  // --- Vendor Extraction ---
  // Use the first non-empty line that's not a number/date as vendor
  const skipPatterns = /^[\d\s\/\-\.\$₹€£#*]+$/;
  let vendor: string | undefined;
  for (const line of lines.slice(0, 5)) {
    if (!skipPatterns.test(line) && line.length > 2 && line.length < 60) {
      vendor = line;
      break;
    }
  }

  // --- Line Items Extraction ---
  const items: Array<{ name: string; price: number }> = [];
  const itemPattern = /^(.+?)\s+([0-9,]+(?:\.[0-9]{1,2})?)\s*$/;
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      const price = parseFloat(match[2].replace(/,/g, ""));
      if (!isNaN(price) && price > 0 && price < (amount ?? Infinity)) {
        items.push({ name: match[1].trim(), price });
      }
    }
  }

  return {
    vendor,
    date,
    amount,
    items: items.slice(0, 10), // limit to 10 items
  };
}

export async function processReceipt(
  imageData: string | File | Blob
): Promise<ExtractedReceiptData> {
  const rawText = await extractTextFromImage(imageData);
  const parsed = parseReceiptText(rawText);
  return { ...parsed, rawText };
}
