// src/utils/browserNotifications.ts
//
// Browser notification utility for medication reminders.
// Uses the Web Notifications API — works in Chrome, Firefox, Edge.
// Safari has limited support.

export class BrowserNotifications {
  private static hasPermission = false;
  private static timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // ─── Request permission ─────────────────────────────────────────────────────
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  // ─── Show a notification now ────────────────────────────────────────────────
  static show(title: string, options?: NotificationOptions): Notification | null {
    if (!this.hasPermission || Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon:              '/caresync-icon.png',
      badge:             '/caresync-badge.png',
      requireInteraction: true,
      tag:               'medication-reminder',
      ...options,
    });

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30_000);
    return notification;
  }

  // ─── Schedule a reminder 15 min before scheduled time ──────────────────────
  static scheduleReminder(
    id:            string,
    medicationName: string,
    dosage:        string,
    scheduledTime: Date,
    onClick?:      () => void
  ): void {
    const now          = new Date();
    const reminderTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
    const delay        = reminderTime.getTime() - now.getTime();

    // Clear any existing reminder for this id
    this.clearReminder(id);

    if (delay > 0) {
      // Future — schedule the reminder
      const timer = setTimeout(() => {
        const notification = this.show('⏰ Medication Reminder', {
          body:    `Time to take ${medicationName} (${dosage}) in 15 minutes`,
          tag:     `reminder-${id}`,
        });

        if (notification && onClick) {
          notification.onclick = () => { onClick(); notification.close(); };
        }
      }, delay);

      this.timers.set(id, timer);

    } else if (delay > -30 * 60 * 1000) {
      // Overdue within last 30 minutes — show immediately
      const notification = this.show('⚠️ Overdue Medication', {
        body: `${medicationName} (${dosage}) was due at ${scheduledTime.toLocaleTimeString()}`,
        tag:  `overdue-${id}`,
      });

      if (notification && onClick) {
        notification.onclick = () => { onClick(); notification.close(); };
      }
    }
  }

  // ─── Clear a single reminder ────────────────────────────────────────────────
  static clearReminder(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  // ─── Clear all reminders ────────────────────────────────────────────────────
  static clearAllReminders(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  // ─── Test notification ──────────────────────────────────────────────────────
  static test(): void {
    this.show('🧪 Test Notification', {
      body:              'If you can see this, notifications are working!',
      requireInteraction: false,
      tag:               'test',
    });
  }

  // ─── Current permission status ──────────────────────────────────────────────
  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  // ─── How many reminders are scheduled ──────────────────────────────────────
  static getScheduledCount(): number {
    return this.timers.size;
  }
}