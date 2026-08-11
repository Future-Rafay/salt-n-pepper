import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Order, Session } from "./types";

const sessionKey = "saltnpepper.staff.session.v1";
const ordersKey = "saltnpepper.staff.orders.v1";

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
