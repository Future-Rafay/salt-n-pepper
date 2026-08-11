import type { Order } from "../types";
import { receiptToEscPosText, type PaperWidth } from "./receipt";

export type PrinterConfig = {
  paperWidth: PaperWidth;
  connection: "android-print-service" | "bluetooth-escpos";
  address?: string;
};

export async function printReceipt(order: Order, config: PrinterConfig) {
  const payload = receiptToEscPosText(order, config.paperWidth);
  return {
    ok: false,
    payload,
    message: "Printer adapter pending real terminal/printer confirmation.",
  };
}
