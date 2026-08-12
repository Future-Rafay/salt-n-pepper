import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

export const colors = {
  plum: "#1C1917",
  saffron: "#B43A25",
  bg: "#F7F2E8",
  surface: "#FFFDF8",
  text: "#1C1917",
  muted: "#6F675E",
  border: "#D8CDBD",
  subtle: "#EFE6D8",
  success: "#287A54",
  warning: "#9A6700",
  danger: "#B42318",
};

export function Button({
  label,
  onPress,
  danger,
  secondary,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: unavailable }}
      disabled={unavailable}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        danger ? styles.dangerButton : secondary ? styles.secondaryButton : styles.primaryButton,
        unavailable && styles.disabled,
        pressed && !unavailable && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={secondary ? colors.text : "#FFFFFF"} /> : null}
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, error, multiline, style: _style, ...inputProps }: Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  style?: never;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: inputProps.editable === false }}
        autoCapitalize="none"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        {...inputProps}
      />
      {error ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.plum} />
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { alignSelf: "center", gap: 16, maxWidth: 920, padding: 16, paddingBottom: 32, width: "100%" },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  title: { color: colors.text, fontSize: 24, fontWeight: "800", lineHeight: 31 },
  wordmark: { color: colors.text, fontSize: 34, fontWeight: "900", letterSpacing: -2 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, elevation: 2, gap: 10, padding: 16 },
  row: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  label: { color: colors.text, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  field: { gap: 6 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: 14 },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: "top" },
  button: { alignItems: "center", borderRadius: 12, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, paddingHorizontal: 16, paddingVertical: 12 },
  primaryButton: { backgroundColor: colors.plum },
  secondaryButton: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  dangerButton: { backgroundColor: colors.danger },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
  buttonText: { color: "#FFFFFF", flexShrink: 1, fontSize: 15, fontWeight: "800", textAlign: "center" },
  secondaryButtonText: { color: colors.text },
  status: { alignSelf: "flex-start", backgroundColor: colors.subtle, borderRadius: 999, color: colors.text, fontSize: 12, fontWeight: "800", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 6 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800", lineHeight: 24 },
  divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
});
