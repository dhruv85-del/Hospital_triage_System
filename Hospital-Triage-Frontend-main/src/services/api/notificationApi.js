import { mockStore } from '../mockStore';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getNotifications(userId) {
  await delay(150);
  const notifications = mockStore.getNotifications(userId);
  return { success: true, notifications };
}

export async function markNotificationAsRead(notificationId) {
  await delay(100);
  mockStore.markNotificationRead(notificationId);
  return { success: true };
}
