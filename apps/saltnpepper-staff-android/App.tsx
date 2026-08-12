import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, FlatList, Image, Linking, Modal, Platform, Pressable, RefreshControl, ScrollView, SectionList, StatusBar, StyleSheet, Text, View } from "react-native";

import * as api from "./src/api";
import { POLL_MS } from "./src/config";
import { formatChf, formatZurichDateTime, fulfillmentLabel, groupOrders, localizedSnapshot, paymentStatusLabel, statusLabel, totalItemQuantity, type Language } from "./src/presentation";
import { getBondedPrinters, printReceipt, type BondedPrinter, type PrinterConfig } from "./src/printer/adapter";
import { formatReceipt } from "./src/printer/receipt";
import { registerDeviceForPush, playNewOrderAlert } from "./src/push";
import { loadCachedOrders, loadLanguage, loadPrinterConfig, loadSession, saveCachedOrders, saveLanguage, savePrinterConfig, saveSession } from "./src/storage";
import type { Order, Session } from "./src/types";
import { Button, Field, Loading, colors, styles } from "./src/ui";

type Screen = "queue" | "settings";
type AuthorizedRequest = <T>(operation: (accessToken: string) => Promise<T>) => Promise<T>;

const words = {
  de: { title: "Bestellungen", settings: "Einstellungen", queue: "Bestellungen", offline: "Offline – gespeicherte Bestellungen sind verfügbar, Aktionen sind deaktiviert.", live: "Live · Aktualisierung alle 10 Sekunden", empty: "Keine aktiven Bestellungen", retry: "Erneut versuchen", items: "Artikel", scheduled: "Geplant", placed: "Bestellt", products: "Bestellte Artikel", totals: "Beträge", customer: "Kunde & Lieferung", payment: "Zahlung", timeline: "Verlauf", note: "Bestellhinweis", subtotal: "Zwischensumme", discount: "Rabatt", deliveryFee: "Liefergebühr", tax: "Steuer", total: "Gesamt", print: "Beleg drucken", preview: "Belegvorschau", eta: "+10 Min. ETA", cash: "Barzahlung bestätigen", close: "Zurück", danger: "Gefahrenbereich", cancel: "Bestellung stornieren", refund: "Erstatten & stornieren", reason: "Grund", confirmCancel: "Stornierung bestätigen", confirmRefund: "Erstattung & Stornierung bestätigen", language: "Sprache", printer: "Drucker", printMode: "Druckmethode", systemPrint: "Android-Druckdienst", bluetooth: "Bluetooth ESC/POS", paired: "Gekoppelte Drucker", refreshPrinters: "Drucker aktualisieren", testPrint: "Testbeleg", width: "Papierbreite", autoCut: "Automatisch schneiden", signOut: "Abmelden", signOutConfirm: "Möchten Sie sich wirklich abmelden?", cancelAction: "Abbrechen", confirm: "Abmelden", noPrinter: "Koppeln Sie den Drucker zuerst in den Android-Einstellungen.", loading: "Wird geladen…", more: "weitere", contact: "Kontakt" },
  en: { title: "Orders", settings: "Settings", queue: "Orders", offline: "Offline – cached orders remain available; actions are disabled.", live: "Live · refreshes every 10 seconds", empty: "No active orders", retry: "Retry", items: "items", scheduled: "Scheduled", placed: "Placed", products: "Ordered items", totals: "Totals", customer: "Customer & fulfillment", payment: "Payment", timeline: "Timeline", note: "Order note", subtotal: "Subtotal", discount: "Discount", deliveryFee: "Delivery fee", tax: "Tax", total: "Total", print: "Print receipt", preview: "Receipt preview", eta: "+10 min ETA", cash: "Confirm cash paid", close: "Back", danger: "Danger zone", cancel: "Cancel order", refund: "Refund & cancel", reason: "Reason", confirmCancel: "Confirm cancellation", confirmRefund: "Confirm refund & cancellation", language: "Language", printer: "Printer", printMode: "Print method", systemPrint: "Android print service", bluetooth: "Bluetooth ESC/POS", paired: "Paired printers", refreshPrinters: "Refresh printers", testPrint: "Test receipt", width: "Paper width", autoCut: "Automatic cutter", signOut: "Sign out", signOutConfirm: "Are you sure you want to sign out?", cancelAction: "Cancel", confirm: "Sign out", noPrinter: "Pair the printer in Android Settings first.", loading: "Loading…", more: "more", contact: "Contact" },
} as const;

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [screen, setScreen] = useState<Screen>("queue");
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<Language>("de");
  const [printer, setPrinter] = useState<PrinterConfig>({ paperWidth: 58, connection: "android-print-service", autoCut: false });
  const latestOrderNumber = useRef<string | undefined>(undefined);

  useEffect(() => { Promise.all([loadSession(), loadCachedOrders(), loadLanguage(), loadPrinterConfig()]).then(([savedSession, cached, savedLanguage, savedPrinter]) => { setSession(savedSession); setOrders(cached); setLanguage(savedLanguage); setPrinter(savedPrinter); setBooting(false); }); }, []);

  const runAuthorized = useCallback(async <T,>(operation: (token: string) => Promise<T>) => {
    if (!session) throw new api.ApiError(401, "TOKEN_REQUIRED");
    try { return await operation(session.accessToken); }
    catch (error) {
      if (!(error instanceof api.ApiError) || error.status !== 401) throw error;
      const refreshed = await api.refresh(session.refreshToken);
      setSession(refreshed); await saveSession(refreshed);
      return operation(refreshed.accessToken);
    }
  }, [session]);

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (!session) return;
    if (showRefresh) setRefreshing(true);
    try {
      const next = await runAuthorized(api.getOrders);
      if (latestOrderNumber.current && next[0]?.orderNumber !== latestOrderNumber.current) playNewOrderAlert();
      latestOrderNumber.current = next[0]?.orderNumber;
      setOrders(next); setOffline(false); await saveCachedOrders(next);
    } catch { setOffline(true); }
    finally { setRefreshing(false); }
  }, [runAuthorized, session]);

  useEffect(() => {
    void loadOrders();
    const timer = setInterval(loadOrders, POLL_MS);
    const listener = AppState.addEventListener("change", (state) => { if (state === "active") void loadOrders(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [loadOrders]);

  if (booting) return <Loading />;
  if (!session) return <LoginScreen language={language} onLogin={async (next) => { setSession(next); await saveSession(next); }} />;
  const w = words[language];

  return <View style={[styles.screen, appStyles.safe]}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
    <View style={appStyles.header}>
      <View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.title}>Salt<Text style={{ color: colors.saffron }}>N</Text>Pepper · {screen === "queue" ? w.title : w.settings}</Text><Text accessibilityLiveRegion="polite" style={styles.subtitle}>{offline ? w.offline : w.live}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel={screen === "queue" ? w.settings : w.queue} onPress={() => setScreen(screen === "queue" ? "settings" : "queue")} style={({ pressed }) => [appStyles.headerButton, pressed && styles.pressed]}><Text style={appStyles.headerButtonText}>{screen === "queue" ? w.settings : w.queue}</Text></Pressable>
    </View>
    {offline ? <View style={appStyles.offline}><Text style={appStyles.offlineText}>{w.offline}</Text></View> : null}
    {screen === "settings" ? <SettingsScreen language={language} setLanguage={async (value) => { setLanguage(value); await saveLanguage(value); }} session={session} runAuthorized={runAuthorized} printer={printer} setPrinter={async (value) => { setPrinter(value); await savePrinterConfig(value); }} onLogout={() => Alert.alert(w.signOut, w.signOutConfirm, [{ text: w.cancelAction, style: "cancel" }, { text: w.confirm, style: "destructive", onPress: async () => { await api.logout(session.refreshToken).catch(() => null); await saveSession(null); setSession(null); } }])} /> : <QueueScreen language={language} orders={orders} offline={offline} refreshing={refreshing} onRefresh={() => loadOrders(true)} onSelect={async (order) => { setSelected(order); if (!offline) try { setSelected(await runAuthorized((token) => api.getOrder(token, order.orderNumber))); } catch {} }} />}
    {selected ? <OrderDetail language={language} order={selected} offline={offline} printer={printer} runAuthorized={runAuthorized} onClose={() => setSelected(null)} onChanged={async () => { setSelected(null); await loadOrders(); }} /> : null}
  </View>;
}

function LoginScreen({ language, onLogin }: { language: Language; onLogin: (session: Session) => Promise<void> }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  return <View style={[styles.screen, appStyles.safe]}><ScrollView contentContainerStyle={[styles.content, { flexGrow: 1, justifyContent: "center" }]} keyboardShouldPersistTaps="handled"><Text accessibilityRole="header" style={[styles.wordmark, { alignSelf: "center" }]}>Salt<Text style={{ color: colors.saffron }}>N</Text>Pepper</Text><Text style={styles.title}>{language === "de" ? "Mitarbeiter-Anmeldung" : "Staff login"}</Text><Text style={styles.subtitle}>{language === "de" ? "Mit einem Eigentümer- oder Mitarbeiterkonto anmelden." : "Sign in with an owner or staff account."}</Text><Field label="Email" value={email} keyboardType="email-address" autoComplete="email" onChangeText={setEmail} /><Field label={language === "de" ? "Passwort" : "Password"} value={password} secureTextEntry autoComplete="current-password" onChangeText={setPassword} /><Button label={loading ? words[language].loading : language === "de" ? "Anmelden" : "Sign in"} loading={loading} disabled={!email || !password} onPress={async () => { setLoading(true); try { await onLogin(await api.login(email.trim(), password, "SaltNPepper Android")); } catch { Alert.alert(language === "de" ? "Anmeldung fehlgeschlagen" : "Login failed", language === "de" ? "E-Mail und Passwort prüfen." : "Check the email and password."); } finally { setLoading(false); } }} /></ScrollView></View>;
}

function QueueScreen({ language, orders, offline, refreshing, onRefresh, onSelect }: { language: Language; orders: Order[]; offline: boolean; refreshing: boolean; onRefresh: () => void; onSelect: (order: Order) => void }) {
  const w = words[language]; const sections = groupOrders(orders, language);
  return <SectionList sections={sections} keyExtractor={(item) => item.orderNumber} stickySectionHeadersEnabled contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.saffron]} />} ListEmptyComponent={<View style={[styles.center, { minHeight: 420, gap: 12 }]}><Text style={styles.title}>{w.empty}</Text><Text style={styles.subtitle}>{formatZurichDateTime(new Date().toISOString(), language)}</Text>{offline ? <Button secondary label={w.retry} onPress={onRefresh} /> : null}</View>} renderSectionHeader={({ section }) => <View style={appStyles.sectionHeader}><Text style={styles.sectionTitle}>{section.title}</Text><Text style={appStyles.count}>{section.data.length}</Text></View>} renderItem={({ item }) => <OrderCard language={language} order={item} offline={offline} onPress={() => onSelect(item)} />} />;
}

function OrderCard({ language, order, offline, onPress }: { language: Language; order: Order; offline: boolean; onPress: () => void }) {
  const w = words[language]; const preview = order.items.slice(0, 2); const remaining = order.items.length - preview.length;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${order.orderNumber}, ${statusLabel(order.status, language)}, ${order.customerName}`} accessibilityHint={offline ? w.offline : undefined} onPress={onPress} style={({ pressed }) => [styles.card, appStyles.orderCard, pressed && styles.pressed]}>
    <View style={styles.row}><Text style={appStyles.orderNumber}>{order.orderNumber}</Text><Text style={styles.status}>{statusLabel(order.status, language)}</Text></View>
    <Text style={appStyles.customer}>{order.customerName}</Text>
    <Text style={styles.muted}>{fulfillmentLabel(order.fulfillmentType, language)} · {order.scheduledFor ? w.scheduled : w.placed} {formatZurichDateTime(order.scheduledFor ?? order.createdAt, language)}</Text>
    <View style={styles.divider} />
    {preview.map((item, index) => <Text key={index} numberOfLines={1} style={styles.label}>{item.quantity}× {localizedSnapshot(item.productNameDe, item.productNameEn, language)}{item.variantNameDe || item.variantNameEn ? ` · ${localizedSnapshot(item.variantNameDe, item.variantNameEn, language)}` : ""}</Text>)}
    {remaining > 0 ? <Text style={styles.muted}>+{remaining} {w.more}</Text> : null}
    <View style={styles.row}><Text style={styles.muted}>{totalItemQuantity(order)} {w.items} · {paymentStatusLabel(order.payment?.status ?? null, language)}</Text><Text style={appStyles.total}>{formatChf(order.totalRappen, language)}</Text></View>
  </Pressable>;
}

function OrderDetail({ language, order, offline, printer, runAuthorized, onClose, onChanged }: { language: Language; order: Order; offline: boolean; printer: PrinterConfig; runAuthorized: AuthorizedRequest; onClose: () => void; onChanged: () => Promise<void> }) {
  const w = words[language]; const [busy, setBusy] = useState(""); const [reasonOpen, setReasonOpen] = useState(false); const [reason, setReason] = useState(""); const [preview, setPreview] = useState(false);
  const perform = async (key: string, action: () => Promise<unknown>) => { setBusy(key); try { await action(); await onChanged(); } catch (error) { Alert.alert("Error", error instanceof Error ? error.message : "Action failed. Retry."); } finally { setBusy(""); } };
  const call = () => Linking.openURL(`tel:${order.customerPhone.replace(/\s/g, "")}`);
  const map = order.address ? () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address!.street}, ${order.address!.postalCode} ${order.address!.city}`)}`) : undefined;
  return <Modal visible animationType="slide" onRequestClose={onClose}><View style={[styles.screen, appStyles.safe]}><View style={appStyles.detailHeader}><Pressable accessibilityRole="button" onPress={onClose} style={appStyles.headerButton}><Text style={appStyles.headerButtonText}>‹ {w.close}</Text></Pressable><Text style={appStyles.orderNumber}>{order.orderNumber}</Text><Text style={styles.status}>{statusLabel(order.status, language)}</Text></View><ScrollView contentContainerStyle={styles.content}>
    <View style={[styles.card, appStyles.heroCard]}><Text style={appStyles.heroNumber}>{order.orderNumber}</Text><Text style={appStyles.heroStatus}>{statusLabel(order.status, language)}</Text><Text style={styles.subtitle}>{fulfillmentLabel(order.fulfillmentType, language)} · {formatZurichDateTime(order.scheduledFor ?? order.createdAt, language)}</Text>{order.estimatedReadyAt ? <Text style={styles.label}>ETA · {formatZurichDateTime(order.estimatedReadyAt, language)}</Text> : null}</View>
    <Section title={w.products}>{order.items.map((item, index) => <View key={index} style={appStyles.product}><View style={appStyles.productRow}>{item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={appStyles.productImage} accessibilityLabel={localizedSnapshot(item.productNameDe, item.productNameEn, language)} /> : <View style={[appStyles.productImage, appStyles.placeholder]}><Text style={appStyles.placeholderText}>SNP</Text></View>}<View style={{ flex: 1, gap: 4 }}><Text style={appStyles.productTitle}>{item.quantity}× {localizedSnapshot(item.productNameDe, item.productNameEn, language)}</Text>{item.variantNameDe || item.variantNameEn ? <Text style={styles.muted}>{localizedSnapshot(item.variantNameDe, item.variantNameEn, language)}</Text> : null}<Text style={styles.muted}>{formatChf(item.unitPriceRappen, language)} / {language === "de" ? "Stück" : "each"}</Text></View><Text style={appStyles.total}>{formatChf(item.lineSubtotalRappen, language)}</Text></View>{item.options.map((option, optionIndex) => <Text key={optionIndex} style={appStyles.option}>+ {localizedSnapshot(option.nameDe, option.nameEn, language)}{option.priceDeltaRappen ? ` (${formatChf(option.priceDeltaRappen, language)})` : ""}</Text>)}</View>)}</Section>
    <Section title={w.totals}><MoneyRow label={w.subtotal} value={order.subtotalRappen} language={language} />{order.discountRappen > 0 ? <MoneyRow label={w.discount} value={-order.discountRappen} language={language} /> : null}{order.deliveryFeeRappen > 0 ? <MoneyRow label={w.deliveryFee} value={order.deliveryFeeRappen} language={language} /> : null}{order.taxAmountRappen > 0 ? <MoneyRow label={w.tax} value={order.taxAmountRappen} language={language} /> : null}<View style={styles.divider} /><MoneyRow label={w.total} value={order.totalRappen} language={language} strong /></Section>
    <Section title={w.customer}><Text style={appStyles.customer}>{order.customerName}</Text><Pressable accessibilityRole="link" onPress={call} style={appStyles.link}><Text style={appStyles.linkText}>{order.customerPhone}</Text></Pressable><Text style={styles.muted}>{order.customerEmail}</Text>{order.address ? <Pressable accessibilityRole="link" onPress={map} style={appStyles.link}><Text style={appStyles.linkText}>{order.address.recipientName}{"\n"}{order.address.street}{order.address.streetExtra ? `, ${order.address.streetExtra}` : ""}{"\n"}{order.address.postalCode} {order.address.city}</Text></Pressable> : <Text style={styles.muted}>{fulfillmentLabel(order.fulfillmentType, language)}</Text>}</Section>
    <Section title={w.payment}><Text style={styles.label}>{paymentStatusLabel(order.payment?.status ?? null, language)} · {order.paymentMethod.replaceAll("_", " ")}</Text>{order.note ? <><Text style={[styles.label, { marginTop: 8 }]}>{w.note}</Text><Text style={styles.muted}>{order.note}</Text></> : null}</Section>
    {order.statusEvents.length ? <Section title={w.timeline}>{order.statusEvents.map((event, index) => <View key={index} style={appStyles.timeline}><View style={appStyles.dot} /><View style={{ flex: 1 }}><Text style={styles.label}>{statusLabel(event.toStatus, language)}</Text><Text style={styles.muted}>{formatZurichDateTime(event.createdAt, language)}{event.actorName ? ` · ${event.actorName}` : ""}</Text>{event.reason ? <Text style={styles.muted}>{event.reason}</Text> : null}</View></View>)}</Section> : null}
    <Button secondary label={w.preview} onPress={() => setPreview(true)} /><Button secondary loading={busy === "print"} label={w.print} onPress={() => perform("print", async () => { const result = await printReceipt(order, printer); Alert.alert(w.print, result.message); })} /><Button secondary loading={busy === "eta"} label={w.eta} disabled={offline || ["COMPLETED", "CANCELLED"].includes(order.status)} onPress={() => perform("eta", () => runAuthorized((token) => api.updateEta(token, order, new Date((order.estimatedReadyAt ? new Date(order.estimatedReadyAt) : new Date()).getTime() + 600000).toISOString())))} />{order.allowedActions.canConfirmCash ? <Button secondary loading={busy === "cash"} label={w.cash} disabled={offline} onPress={() => perform("cash", () => runAuthorized((token) => api.confirmCash(token, order.orderNumber)))} /> : null}{order.allowedActions.nextStatus ? <Button loading={busy === "advance"} label={statusLabel(order.allowedActions.nextStatus, language)} disabled={offline} onPress={() => perform("advance", () => runAuthorized((token) => api.advanceOrder(token, order)))} /> : null}
    {(order.allowedActions.canCancel || order.allowedActions.canRefundAndCancel) ? <View style={appStyles.dangerZone}><Text style={appStyles.dangerTitle}>{w.danger}</Text><Button danger label={order.allowedActions.canRefundAndCancel ? `${w.refund} · ${formatChf(order.remainingRefundableRappen, language)}` : w.cancel} disabled={offline || !!busy} onPress={() => setReasonOpen(true)} />{reasonOpen ? <View style={{ gap: 12 }}><Field label={w.reason} value={reason} onChangeText={setReason} multiline error={reason.length > 0 && reason.trim().length < 3 ? (language === "de" ? "Mindestens 3 Zeichen" : "Use at least 3 characters") : undefined} /><Button danger loading={busy === "cancel"} label={order.allowedActions.canRefundAndCancel ? w.confirmRefund : w.confirmCancel} disabled={reason.trim().length < 3} onPress={() => perform("cancel", () => order.allowedActions.canRefundAndCancel ? runAuthorized((token) => api.refundAndCancelOrder(token, order, reason.trim())) : runAuthorized((token) => api.cancelOrder(token, order.orderNumber, reason.trim())))} /><Button secondary label={w.cancelAction} onPress={() => { setReasonOpen(false); setReason(""); }} /></View> : null}</View> : null}
  </ScrollView><ReceiptPreview language={language} order={order} visible={preview} onClose={() => setPreview(false)} /></View></Modal>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.card}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text><View style={styles.divider} />{children}</View>; }
function MoneyRow({ label, value, language, strong }: { label: string; value: number; language: Language; strong?: boolean }) { return <View style={styles.row}><Text style={strong ? appStyles.customer : styles.muted}>{label}</Text><Text style={strong ? appStyles.totalStrong : appStyles.total}>{formatChf(value, language)}</Text></View>; }

function ReceiptPreview({ language, order, visible, onClose }: { language: Language; order: Order; visible: boolean; onClose: () => void }) { return <Modal visible={visible} animationType="fade" onRequestClose={onClose}><View style={[styles.screen, appStyles.safe]}><View style={appStyles.detailHeader}><Text style={styles.title}>{words[language].preview}</Text><Button secondary label={words[language].close} onPress={onClose} /></View><ScrollView contentContainerStyle={styles.content}><View style={appStyles.receipt}><Text selectable style={appStyles.receiptText}>{formatReceipt(order, 58)}</Text></View></ScrollView></View></Modal>; }

function SettingsScreen({ language, setLanguage, session, runAuthorized, printer, setPrinter, onLogout }: { language: Language; setLanguage: (language: Language) => void; session: Session; runAuthorized: AuthorizedRequest; printer: PrinterConfig; setPrinter: (printer: PrinterConfig) => void; onLogout: () => void }) {
  const w = words[language]; const [printers, setPrinters] = useState<BondedPrinter[]>([]); const [printerError, setPrinterError] = useState("");
  const refresh = async () => { setPrinterError(""); try { setPrinters(await getBondedPrinters()); } catch (error) { setPrinterError(error instanceof Error ? error.message : w.noPrinter); } };
  return <ScrollView contentContainerStyle={styles.content}><Section title={session.user.name ?? session.user.email}><Text style={styles.muted}>{session.user.email} · {session.user.role}</Text></Section><Section title={w.language}><View style={appStyles.choiceRow}><Choice selected={language === "de"} label="Deutsch" onPress={() => setLanguage("de")} /><Choice selected={language === "en"} label="English" onPress={() => setLanguage("en")} /></View></Section><Section title={w.printer}><Text style={styles.label}>{w.printMode}</Text><View style={appStyles.choiceRow}><Choice selected={printer.connection === "android-print-service"} label={w.systemPrint} onPress={() => setPrinter({ ...printer, connection: "android-print-service" })} /><Choice selected={printer.connection === "bluetooth-escpos"} label={w.bluetooth} onPress={() => setPrinter({ ...printer, connection: "bluetooth-escpos" })} /></View><Text style={styles.label}>{w.width}</Text><View style={appStyles.choiceRow}><Choice selected={printer.paperWidth === 58} label="58 mm" onPress={() => setPrinter({ ...printer, paperWidth: 58 })} /><Choice selected={printer.paperWidth === 80} label="80 mm" onPress={() => setPrinter({ ...printer, paperWidth: 80 })} /></View><Choice selected={!!printer.autoCut} label={w.autoCut} onPress={() => setPrinter({ ...printer, autoCut: !printer.autoCut })} />{printer.connection === "bluetooth-escpos" ? <><Button secondary label={w.refreshPrinters} onPress={refresh} />{printerError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{printerError}</Text> : null}{printers.length ? <FlatList scrollEnabled={false} data={printers} keyExtractor={(item) => item.address} renderItem={({ item }) => <Choice selected={printer.address === item.address} label={`${item.name}\n${item.address}`} onPress={() => setPrinter({ ...printer, address: item.address })} />} /> : <Text style={styles.muted}>{w.noPrinter}</Text>}</> : null}</Section><Button secondary label={language === "de" ? "Push-Benachrichtigungen registrieren" : "Register push alerts"} onPress={() => runAuthorized(registerDeviceForPush).catch(() => Alert.alert("Push", "Check Firebase configuration."))} /><View style={{ height: 24 }} /><Button danger label={w.signOut} onPress={onLogout} /></ScrollView>;
}

function Choice({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [appStyles.choice, selected && appStyles.choiceSelected, pressed && styles.pressed]}><Text style={[styles.label, selected && { color: "#FFFFFF" }]}>{label}</Text></Pressable>; }

const appStyles = StyleSheet.create({
  safe: { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  header: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, padding: 16 },
  headerButton: { alignItems: "center", justifyContent: "center", minHeight: 48, minWidth: 72, paddingHorizontal: 12 }, headerButtonText: { color: colors.plum, fontSize: 15, fontWeight: "800" },
  offline: { backgroundColor: "#FFF3CD", borderBottomColor: "#E6C65A", borderBottomWidth: 1, padding: 10 }, offlineText: { color: "#664D03", fontSize: 13, fontWeight: "700", textAlign: "center" },
  sectionHeader: { alignItems: "center", alignSelf: "center", backgroundColor: colors.bg, flexDirection: "row", gap: 8, maxWidth: 920, paddingBottom: 10, paddingTop: 8, width: "100%" }, count: { backgroundColor: colors.saffron, borderRadius: 999, color: "white", fontWeight: "800", minWidth: 26, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 4, textAlign: "center" },
  orderCard: { borderLeftColor: colors.saffron, borderLeftWidth: 5 }, orderNumber: { color: colors.text, fontSize: 18, fontWeight: "900" }, customer: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 23 }, total: { color: colors.text, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "800" }, totalStrong: { color: colors.saffron, fontSize: 19, fontVariant: ["tabular-nums"], fontWeight: "900" },
  detailHeader: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 12, justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8 }, heroCard: { backgroundColor: colors.plum }, heroNumber: { color: "white", fontSize: 28, fontWeight: "900" }, heroStatus: { color: "#F7CBBE", fontSize: 17, fontWeight: "800" },
  product: { gap: 8, paddingVertical: 6 }, productRow: { alignItems: "center", flexDirection: "row", gap: 12 }, productImage: { backgroundColor: colors.subtle, borderRadius: 12, height: 64, width: 64 }, placeholder: { alignItems: "center", justifyContent: "center" }, placeholderText: { color: colors.saffron, fontWeight: "900" }, productTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 22 }, option: { color: colors.muted, fontSize: 13, lineHeight: 19, marginLeft: 76 },
  link: { justifyContent: "center", minHeight: 48 }, linkText: { color: colors.saffron, fontSize: 15, fontWeight: "700", lineHeight: 22 }, timeline: { flexDirection: "row", gap: 12, paddingVertical: 6 }, dot: { backgroundColor: colors.saffron, borderRadius: 6, height: 12, marginTop: 4, width: 12 }, dangerZone: { borderColor: colors.danger, borderRadius: 16, borderWidth: 1, gap: 14, marginTop: 24, padding: 16 }, dangerTitle: { color: colors.danger, fontSize: 18, fontWeight: "900" },
  receipt: { alignSelf: "center", backgroundColor: "white", elevation: 3, maxWidth: 440, padding: 24, width: "100%" }, receiptText: { color: "black", fontFamily: Platform.OS === "android" ? "monospace" : "Courier", fontSize: 12, lineHeight: 18 },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { alignItems: "center", borderColor: colors.border, borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 48, minWidth: 96, paddingHorizontal: 14, paddingVertical: 10 }, choiceSelected: { backgroundColor: colors.plum, borderColor: colors.plum },
});
