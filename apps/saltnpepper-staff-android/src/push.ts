import { Vibration } from "react-native";

import { registerPushToken } from "./api";

export async function registerDeviceForPush(accessToken: string) {
  await registerPushToken(accessToken, null);
}

export function playNewOrderAlert() {
  Vibration.vibrate([0, 250, 120, 250]);
}