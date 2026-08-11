import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, FlatList, Modal, Platform, Pressable, ScrollView, StatusBar, Text, View } from "react-native";

import * as api from "./src/api";
import { API_BASE_URL, POLL_MS } from "./src/config";
import { printReceipt, type PrinterConfig } from "./src/printer/adapter";
import { registerDeviceForPush, playNewOrderAlert } from "./src/push";
import { loadCachedOrders, loadSession, saveCachedOrders, saveSession } from "./src/storage";
import type { Order, Session } from "./src/types";
import { Button, Field, Loading, colors, styles } from "./src/ui";

type Screen = "queue" | "settings";
type AuthorizedRequest = <T>(operation: (accessToken: string) => Promise<T>) => Promise<T>;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [screen, setScreen] = useState<Screen>("queue");
  const [offline, setOffline] = useState(false);
  const [printer, setPrinter] = useState<PrinterConfig>({ paperWidth: 58, connection: "bluetooth-escpos" });
  const latestOrderNumber = useRef<string | undefined>(undefined);

  useEffect(() => {
    Promise.all([loadSession(), loadCachedOrders()]).then(([savedSession, cachedOrders]) => {
      setSession(savedSession);
      setOrders(cachedOrders);
      setBooting(false);
    });
  }, []);

  const runAuthorized = useCallback(async <T,>(operation: (accessToken: string) => Promise<T>) => {
    if (!session) throw new api.ApiError(401, "TOKEN_REQUIRED");
    try {
      return await operation(session.accessToken);
    } catch (error) {
      if (!(error instanceof api.ApiError) || error.status !== 401) throw error;
      const refreshed = await api.refresh(session.refreshToken);
      setSession(refreshed);
      await saveSession(refreshed);
      return operation(refreshed.accessToken);
    }
  }, [session]);

  const loadOrders = useCallback(async () => {
    if (!session) return;
    try {
      const next = await runAuthorized(api.getOrders);
      if (latestOrderNumber.current && next[0]?.orderNumber && next[0].orderNumber !== latestOrderNumber.current) playNewOrderAlert();
      latestOrderNumber.current = next[0]?.orderNumber;
      setOrders(next);
      setOffline(false);
      await saveCachedOrders(next);
    } catch {
      setOffline(true);
    }
  }, [runAuthorized, session]);

  useEffect(() => {
    void loadOrders();
    const timer = setInterval(loadOrders, POLL_MS);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadOrders();
    });
    return () => {
      clearInterval(timer);
      appState.remove();
    };
  }, [loadOrders]);

  if (booting) return <Loading />;
  if (!session) return <LoginScreen onLogin={async (next) => { setSession(next); await saveSession(next); }} />;

  return (
    <View style={[styles.screen, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, paddingBottom: 12 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={[styles.row, { borderBottomColor: colors.border, borderBottomWidth: 1, padding: 12 }]}>
          <View>
            <Text style={styles.title}>SaltNPepper Orders</Text>
            <Text style={styles.subtitle}>{offline ? "Offline cache, actions disabled" : "Live queue refreshes every 10 seconds"}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open settings" hitSlop={12} onPress={() => setScreen(screen === "queue" ? "settings" : "queue")}>
            <Text style={{ color: colors.plum, fontWeight: "800" }}>{screen === "queue" ? "Settings" : "Queue"}</Text>
          </Pressable>
        </View>
        {screen === "settings" ? (
          <SettingsScreen
            session={session}
            runAuthorized={runAuthorized}
            printer={printer}
            setPrinter={setPrinter}
            onLogout={async () => {
              await api.logout(session.refreshToken).catch(() => null);
              await saveSession(null);
              setSession(null);
            }}
          />
        ) : (
          <QueueScreen orders={orders} offline={offline} onSelect={setSelected} />
        )}
        {selected ? (
          <OrderModal
            order={selected}
            offline={offline}
            printer={printer}
            runAuthorized={runAuthorized}
            onClose={() => setSelected(null)}
            onChanged={async () => {
              setSelected(null);
              await loadOrders();
            }}
          />
        ) : null}
      </View>
  );
}

function LoginScreen({ onLogin }: { onLogin: (session: Session) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceName, setDeviceName] = useState("SaltNPepper Android");
  const [loading, setLoading] = useState(false);

  return (
    <View style={[styles.screen, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, paddingBottom: 12 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <View style={[styles.content, { flex: 1, justifyContent: "center" }]}>
          <Text accessibilityRole="header" style={[styles.wordmark, { alignSelf: "center", marginBottom: 18 }]}>SaltNPepper</Text>
          <Text style={styles.title}>Staff login</Text>
          <Text style={styles.subtitle}>Use an owner or staff account from the SaltNPepper admin panel.</Text>
          <Field label="Email" value={email} onChangeText={setEmail} />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Field label="Device name" value={deviceName} onChangeText={setDeviceName} />
          <Button
            label={loading ? "Signing in..." : "Sign in"}
            disabled={loading}
            onPress={async () => {
              setLoading(true);
              try {
                await onLogin(await api.login(email, password, deviceName));
              } catch {
                Alert.alert("Login failed", "Check the account and password.");
              } finally {
                setLoading(false);
              }
            }}
          />
        </View>
      </View>
  );
}

function QueueScreen({ orders, offline, onSelect }: { orders: Order[]; offline: boolean; onSelect: (order: Order) => void }) {
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(item) => item.orderNumber}
      ListEmptyComponent={<View style={[styles.center, { minHeight: 420 }]}><Text style={[styles.title, { fontSize: 30 }]}>No Orders Available</Text><Text style={[styles.subtitle, { marginTop: 8 }]}>{new Intl.DateTimeFormat("en-CH", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Zurich" }).format(new Date())}</Text></View>}
      renderItem={({ item }) => (
        <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.orderNumber}`} disabled={offline} onPress={() => onSelect(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed, offline && styles.disabled]}>
          <View style={styles.row}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>{item.orderNumber}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.muted}>{item.customerName} · {item.fulfillmentType} · CHF {(item.totalRappen / 100).toFixed(2)}</Text>
        </Pressable>
      )}
    />
  );
}

function OrderModal({ order, runAuthorized, offline, printer, onClose, onChanged }: { order: Order; runAuthorized: AuthorizedRequest; offline: boolean; printer: PrinterConfig; onClose: () => void; onChanged: () => Promise<void> }) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, paddingBottom: 12 }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title}>{order.orderNumber}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close order" hitSlop={12} onPress={onClose}>
              <Text style={{ color: colors.plum, fontWeight: "800" }}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.status}>{order.status}</Text>
          <View style={styles.card}>
            <Text style={styles.label}>{order.customerName}</Text>
            <Text style={styles.muted}>{order.customerPhone}</Text>
            {order.address ? <Text style={styles.muted}>{order.address.street}, {order.address.postalCode} {order.address.city}</Text> : null}
          </View>
          <View style={styles.card}>
            {order.items.map((item) => (
              <Text key={item.id} style={styles.muted}>{item.quantity}x {item.productNameEnSnapshot}</Text>
            ))}
          </View>
          <Button label="Print receipt" disabled={offline} onPress={async () => Alert.alert("Printer", (await printReceipt(order, printer)).message)} />
          <Button label="Add 10 min" disabled={offline || ["COMPLETED", "CANCELLED"].includes(order.status)} onPress={async () => { const base = order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : new Date(); await runAuthorized((token) => api.updateEta(token, order, new Date(base.getTime() + 10 * 60_000).toISOString())); await onChanged(); }} />
          <Button label={order.allowedActions.nextStatus ? `Move to ${order.allowedActions.nextStatus}` : "No next status"} disabled={offline || !order.allowedActions.nextStatus} onPress={async () => { await runAuthorized((token) => api.advanceOrder(token, order)); await onChanged(); }} />
          <Button label="Confirm cash paid" disabled={offline || !order.allowedActions.canConfirmCash} onPress={async () => { await runAuthorized((token) => api.confirmCash(token, order.orderNumber)); await onChanged(); }} />
          <View style={{ height: 20 }} />
          <Button label={order.allowedActions.canRefundAndCancel ? "Refund & cancel" : "Cancel order"} danger disabled={offline || (!order.allowedActions.canCancel && !order.allowedActions.canRefundAndCancel)} onPress={() => setReasonOpen(true)} />
          {reasonOpen ? (
            <View style={[styles.card, { borderColor: colors.danger }]}>
              <Text style={styles.label}>{order.allowedActions.canRefundAndCancel ? `Full refund CHF ${(order.remainingRefundableRappen / 100).toFixed(2)} and cancellation` : "Cancellation reason"}</Text>
              <Field label="Reason" value={reason} onChangeText={setReason} multiline />
              <Button label={order.allowedActions.canRefundAndCancel ? "Confirm refund & cancellation" : "Confirm cancellation"} danger disabled={reason.trim().length < 3} onPress={async () => { if (order.allowedActions.canRefundAndCancel) await runAuthorized((token) => api.refundAndCancelOrder(token, order, reason)); else await runAuthorized((token) => api.cancelOrder(token, order.orderNumber, reason)); await onChanged(); }} />
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function SettingsScreen({ session, runAuthorized, printer, setPrinter, onLogout }: { session: Session; runAuthorized: AuthorizedRequest; printer: PrinterConfig; setPrinter: (config: PrinterConfig) => void; onLogout: () => Promise<void> }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>{session.user.name ?? session.user.email}</Text>
        <Text style={styles.muted}>{session.user.role}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Printer setup</Text>
        <Text style={styles.muted}>Current width: {printer.paperWidth}mm</Text>
        <View style={styles.row}>
          <Button label="58mm" onPress={() => setPrinter({ ...printer, paperWidth: 58 })} />
          <Button label="80mm" onPress={() => setPrinter({ ...printer, paperWidth: 80 })} />
        </View>
      </View>
      <Button label="Register push alerts" onPress={() => runAuthorized(registerDeviceForPush).catch(() => Alert.alert("Push setup failed", "Check Firebase configuration."))} />
      <View style={{ height: 24 }} />
      <Button label="Sign out" danger onPress={onLogout} />
    </ScrollView>
  );
}
