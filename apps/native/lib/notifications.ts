import * as Notifications from "expo-notifications";

/**
 * The daily reminder.
 *
 * ── Why the pre-permission screen exists ────────────────────────────────────
 * The OS permission prompt is ONE SHOT per install. Ask at the wrong moment and
 * the answer is no forever, with no way to ask again from inside the app. So O8
 * shows what the reminder actually looks like and the promise attached to it,
 * and this is only ever called after the player has said yes to that.
 *
 * ── What the reminder is allowed to say ─────────────────────────────────────
 * One a day, at the time they picked, and never about days they missed
 * (constraint 4). There is no "you haven't played in 3 days", no streak
 * warning, no "your quilt misses you". The copy below is the whole vocabulary,
 * and it is deliberately about the Daily being ready rather than about the
 * player having failed to show up.
 */

/** The hour each rhythm maps to. */
const HOUR: Record<string, number> = {
  Morning: 7,
  Lunch: 12,
  Evening: 19,
  "Before bed": 21,
};

export const RHYTHM_HOURS = HOUR;

/**
 * Ask the OS. Returns whether we may actually send anything.
 *
 * Never called speculatively — only from O8's "Yes, remind me", after the value
 * has been shown.
 */
export async function requestPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    // `canAskAgain` false means the player already declined at OS level. Asking
    // produces nothing and there is no in-app way around it, so we stop.
    if (!existing.canAskAgain) return false;

    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    // A permissions failure is never worth blocking onboarding over — the
    // player still gets the app, just without reminders.
    return false;
  }
}

/**
 * Schedule the daily reminder at the chosen hour.
 *
 * Cancels anything previously scheduled first, so changing the rhythm in
 * Settings replaces the reminder rather than adding a second one.
 */
export async function scheduleDailyReminder(rhythm: string): Promise<boolean> {
  const hour = HOUR[rhythm];
  if (hour === undefined) return false;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "WordQuilt",
        // About the Daily being ready. Never about the player being absent.
        body: "Today's Daily is up whenever you are.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 30,
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Used when a player turns reminders off in Settings. */
export async function cancelReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nothing useful to do — and nothing worth telling the player about.
  }
}
