import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { BUSINESS } from "@/lib/placeholder-data";
import { TILL_NAME, TILL_NUMBER } from "@/lib/mpesa/daraja";
import { formatKes } from "@/lib/payments/balance";

// The logo is read from disk at runtime; next.config.ts's
// outputFileTracingIncludes ships it with the serverless functions.
const LOGO_PATH = path.join(process.cwd(), "public", "images", "Kifaru-logo.png");

const BURGUNDY = rgb(0x7d / 255, 0x1c / 255, 0x35 / 255);
const GOLD = rgb(0xc9 / 255, 0xa2 / 255, 0x27 / 255);
const INK = rgb(0x17 / 255, 0x15 / 255, 0x14 / 255);
const MUTED = rgb(0x5c / 255, 0x59 / 255, 0x55 / 255);
const RULE = rgb(0xe7 / 255, 0xe7 / 255, 0xe6 / 255);
const GREEN = rgb(0x15 / 255, 0x80 / 255, 0x3d / 255);

export type InvoiceLine = { description: string; detail?: string; amount: number };

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: Date;
  billTo: { name: string; phone?: string | null; email?: string | null };
  lines: InvoiceLine[];
  total: number;
  paid: number;
  balance: number;
  mpesaReceipt: string | null;
};

// The built-in PDF fonts only cover WinAnsi; drop anything else (emoji,
// non-Latin scripts in a typed-in vehicle name) rather than fail the invoice.
function safe(text: string) {
  return text.replace(/[^\x20-\x7E\xA0-\xFF–—‘’“”•…]/g, "");
}

function drawRight(page: PDFPage, text: string, x: number, y: number, size: number, font: PDFFont, color = INK) {
  const t = safe(text);
  page.drawText(t, { x: x - font.widthOfTextAtSize(t, size), y, size, font, color });
}

export function formatInvoiceDate(date: Date) {
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });
}

export async function buildInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${data.invoiceNumber}`);
  pdf.setAuthor(BUSINESS.name);

  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const left = 50;
  const right = width - 50;

  // Brand band across the top.
  page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: BURGUNDY });
  page.drawRectangle({ x: 0, y: height - 10, width, height: 2, color: GOLD });

  // Header: logo + business details on the left, invoice meta on the right.
  let y = height - 50;
  try {
    const logo = await pdf.embedPng(await readFile(LOGO_PATH));
    const size = 72;
    page.drawImage(logo, { x: left, y: y - size, width: size, height: size });
  } catch (error) {
    console.error("Invoice logo missing", error);
  }
  const textLeft = left + 86;
  page.drawText(safe(BUSINESS.name), { x: textLeft, y: y - 20, size: 16, font: bold, color: INK });
  page.drawText(safe(BUSINESS.phone), { x: textLeft, y: y - 38, size: 9.5, font: regular, color: MUTED });
  page.drawText(safe(BUSINESS.email), { x: textLeft, y: y - 51, size: 9.5, font: regular, color: MUTED });
  page.drawText(safe(BUSINESS.locations.join(" · ")), { x: textLeft, y: y - 64, size: 9.5, font: regular, color: MUTED });

  drawRight(page, "INVOICE", right, y - 22, 24, bold, BURGUNDY);
  drawRight(page, `No. ${data.invoiceNumber}`, right, y - 40, 10, regular, MUTED);
  drawRight(page, formatInvoiceDate(data.issuedAt), right, y - 53, 10, regular, MUTED);

  // Billed to.
  y -= 115;
  page.drawLine({ start: { x: left, y: y + 18 }, end: { x: right, y: y + 18 }, thickness: 1, color: RULE });
  page.drawText("BILLED TO", { x: left, y, size: 8.5, font: bold, color: MUTED });
  page.drawText(safe(data.billTo.name), { x: left, y: y - 16, size: 11.5, font: bold, color: INK });
  let billY = y - 30;
  for (const line of [data.billTo.phone, data.billTo.email]) {
    if (!line) continue;
    page.drawText(safe(line), { x: left, y: billY, size: 9.5, font: regular, color: MUTED });
    billY -= 13;
  }

  // PAID badge, opposite the billing block.
  if (data.balance <= 0) {
    const label = "PAID";
    const w = bold.widthOfTextAtSize(label, 12) + 24;
    page.drawRectangle({ x: right - w, y: y - 22, width: w, height: 24, borderColor: GREEN, borderWidth: 1.5, color: rgb(0.94, 0.99, 0.96) });
    page.drawText(label, { x: right - w + 12, y: y - 14, size: 12, font: bold, color: GREEN });
  }

  // Line items.
  y = billY - 30;
  page.drawRectangle({ x: left, y: y - 6, width: right - left, height: 22, color: rgb(0.965, 0.965, 0.965) });
  page.drawText("DESCRIPTION", { x: left + 10, y: y + 1, size: 8.5, font: bold, color: MUTED });
  drawRight(page, "AMOUNT", right - 10, y + 1, 8.5, bold, MUTED);
  y -= 28;

  for (const line of data.lines) {
    page.drawText(safe(line.description), { x: left + 10, y, size: 10.5, font: regular, color: INK, maxWidth: 360 });
    drawRight(page, line.amount < 0 ? `- ${formatKes(-line.amount)}` : formatKes(line.amount), right - 10, y, 10.5, regular, line.amount < 0 ? GREEN : INK);
    if (line.detail) {
      y -= 14;
      page.drawText(safe(line.detail), { x: left + 10, y, size: 9, font: regular, color: MUTED, maxWidth: 360 });
    }
    y -= 12;
    page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.75, color: RULE });
    y -= 18;
  }

  // Totals.
  const labelX = right - 200;
  const totals: [string, string, PDFFont, number][] = [
    ["Total", formatKes(data.total), bold, 12],
    ["Paid (M-Pesa)", formatKes(data.paid), regular, 10.5],
    ["Balance due", formatKes(Math.max(0, data.balance)), bold, 10.5],
  ];
  for (const [label, value, font, size] of totals) {
    page.drawText(label, { x: labelX, y, size, font, color: label === "Balance due" ? BURGUNDY : INK });
    drawRight(page, value, right - 10, y, size, font, label === "Balance due" ? BURGUNDY : INK);
    y -= 20;
  }

  // Payment details.
  y -= 16;
  page.drawText("PAYMENT DETAILS", { x: left, y, size: 8.5, font: bold, color: MUTED });
  y -= 15;
  const paymentLines = [
    `M-Pesa Buy Goods Till ${TILL_NUMBER} · ${TILL_NAME}`,
    data.mpesaReceipt ? `M-Pesa receipt: ${data.mpesaReceipt}` : null,
  ];
  for (const line of paymentLines) {
    if (!line) continue;
    page.drawText(safe(line), { x: left, y, size: 9.5, font: regular, color: INK });
    y -= 13;
  }

  // Footer.
  page.drawLine({ start: { x: left, y: 70 }, end: { x: right, y: 70 }, thickness: 1, color: RULE });
  page.drawText(safe(`Thank you for choosing ${BUSINESS.name}.`), { x: left, y: 52, size: 10, font: bold, color: BURGUNDY });
  page.drawText(safe(`Questions about this invoice? Call ${BUSINESS.phone} or email ${BUSINESS.email}.`), {
    x: left,
    y: 38,
    size: 8.5,
    font: regular,
    color: MUTED,
  });

  return Buffer.from(await pdf.save());
}
