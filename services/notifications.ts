import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = "recurring-expenses";
const MONTHS_AHEAD = 3;
const NOTIFY_HOUR = 9;

export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Dépenses récurrentes",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus === "granted") {
    await setupAndroidChannel();
  }
  return finalStatus === "granted";
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function getChargeDate(day: number, monthOffset: number): Date {
  const now = new Date();
  const targetMonth = now.getMonth() + monthOffset;
  const year = now.getFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const actualDay = Math.min(day, lastDay);
  return new Date(year, month, actualDay, 12, 0, 0);
}

export async function syncNotifications(
  recurringExpenses: { id: number; description: string; amount: number; day: number }[],
  title: string,
  bodyTemplate: string,
): Promise<void> {
  await cancelAllNotifications();
  const now = new Date();

  for (const expense of recurringExpenses) {
    for (let offset = 0; offset < MONTHS_AHEAD; offset++) {
      const chargeDate = getChargeDate(expense.day, offset);
      const notifyDate = new Date(chargeDate);
      notifyDate.setDate(notifyDate.getDate() - 1);
      notifyDate.setHours(NOTIFY_HOUR, 0, 0, 0);

      if (notifyDate <= now) continue;

      const body = bodyTemplate
        .replace("{name}", expense.description)
        .replace("{amount}", expense.amount.toFixed(2));

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notifyDate,
          channelId: CHANNEL_ID,
        },
      });
    }
  }
}
