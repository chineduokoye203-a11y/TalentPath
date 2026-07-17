import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const notificationService = {
  async createNotification(userId: string, title: string, message: string, type: string) {
    const notification = await db.notification.create({
      data: { userId, title, message, type },
    });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendEmail(user.email, title, `<p>Hello ${user.name},</p><p>${message}</p>`);
    }

    return notification;
  },

  async getMyNotifications(userId: string) {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(id: string) {
    return await db.notification.update({
      where: { id },
      data: { read: true },
    });
  },
};
