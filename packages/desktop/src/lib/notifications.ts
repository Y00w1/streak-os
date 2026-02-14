import { isPermissionGranted, requestPermission, sendNotification as sendNotificationNative } from '@tauri-apps/plugin-notification';

/**
 * Send a notification to the user
 * @param title - The notification title
 * @param body - The notification body/message
 */
export async function sendNotification(title: string, body: string): Promise<void> {
  try {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
      await sendNotificationNative({
        title,
        body,
      });
    }
  } catch (error) {
    // Silently fail if notifications are not available
    console.debug('Notification failed:', error);
  }
}
