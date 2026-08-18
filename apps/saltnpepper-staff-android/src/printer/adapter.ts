import type { Order } from "../types";
import { receiptToEscPosText, type PaperWidth } from "./receipt";
import { NativeModules, PermissionsAndroid, Platform } from "react-native";

export type PrinterConfig = {
  paperWidth: PaperWidth;
  connection: "android-print-service" | "bluetooth-escpos";
  address?: string;
  autoCut?: boolean;
};

export type BondedPrinter = { name: string; address: string };

type NativePrinterModule = {
  getBondedPrinters(): Promise<BondedPrinter[]>;
  printEscPos(address: string, receipt: string, paperWidth: PaperWidth, autoCut: boolean): Promise<void>;
  printDocument(receipt: string, documentName: string, paperWidth: PaperWidth): Promise<void>;
};

const nativePrinter = NativeModules.SaltNPepperPrinter as NativePrinterModule | undefined;

async function allowBluetooth() {
  if (Platform.OS !== "android" || Platform.Version < 31) return true;
  return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT)) === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getBondedPrinters() {
  if (!nativePrinter) return [];
  if (!(await allowBluetooth())) throw new Error("Nearby devices permission is required to use a Bluetooth printer.");
  return nativePrinter.getBondedPrinters();
}

export async function printReceipt(order: Order, config: PrinterConfig) {
  const payload = receiptToEscPosText(order, config.paperWidth);
  if (!nativePrinter) return { ok: false, payload, message: "Printing is available only in the Android app." };
  try {
    if (config.connection === "android-print-service") {
      await nativePrinter.printDocument(payload, order.orderNumber, config.paperWidth);
      return { ok: true, payload, message: "Android print preview opened." };
    }
    if (!config.address) return { ok: false, payload, message: "Select a paired Bluetooth printer in Settings first." };
    if (!(await allowBluetooth())) return { ok: false, payload, message: "Nearby devices permission was denied." };
    await nativePrinter.printEscPos(config.address, payload, config.paperWidth, config.autoCut ?? false);
    return { ok: true, payload, message: "Receipt sent to the printer." };
  } catch (error) {
    return { ok: false, payload, message: error instanceof Error ? error.message : "Printing failed. Check the printer and retry." };
  }
}
