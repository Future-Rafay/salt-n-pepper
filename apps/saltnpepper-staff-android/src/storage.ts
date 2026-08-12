import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Language } from "./presentation";
import type { PrinterConfig } from "./printer/adapter";
import type { Order, Session } from "./types";

const sessionKey = "saltnpepper.staff.session.v1";
const ordersKey = "saltnpepper.staff.orders.v1";
const languageKey = "saltnpepper.staff.language.v1";
const printerKey = "saltnpepper.staff.printer.v1";

export async function loadSession() {
  const raw = await AsyncStorage.getItem(sessionKey);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export async function saveSession(session: Session | null) {
  if (session) await AsyncStorage.setItem(sessionKey, JSON.stringify(session));
  else await AsyncStorage.removeItem(sessionKey);
}

export async function loadCachedOrders() {
  const raw = await AsyncStorage.getItem(ordersKey);
  return raw ? (JSON.parse(raw) as Order[]) : [];
}

export async function saveCachedOrders(orders: Order[]) {
  await AsyncStorage.setItem(ordersKey, JSON.stringify(orders));
}

export async function loadLanguage(): Promise<Language> {
  return (await AsyncStorage.getItem(languageKey)) === "en" ? "en" : "de";
}

export async function saveLanguage(language: Language) {
  await AsyncStorage.setItem(languageKey, language);
}

export async function loadPrinterConfig(): Promise<PrinterConfig> {
  const raw = await AsyncStorage.getItem(printerKey);
  return raw ? JSON.parse(raw) as PrinterConfig : { paperWidth: 58, connection: "android-print-service", autoCut: false };
}

export async function savePrinterConfig(config: PrinterConfig) {
  await AsyncStorage.setItem(printerKey, JSON.stringify(config));
}
