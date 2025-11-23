import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationQueryDto } from "./dto/notification-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../common/utils/pagination.util";

// Simple in-memory notification store
// In production, you might want to create a Notification model in Prisma
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly notifications: Map<string, Notification[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createNotificationDto.userId} not found`
      );
    }

    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      userId: createNotificationDto.userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type || "GENERAL",
      link: createNotificationDto.link,
      read: false,
      createdAt: new Date(),
    };

    const current = this.notifications.get(createNotificationDto.userId) || [];
    current.push(notification);
    this.notifications.set(createNotificationDto.userId, current);

    return notification;
  }

  async findAll(
    userId: string,
    query: NotificationQueryDto
  ): Promise<PaginatedResult<Notification>> {
    const { page, limit, skip } = getPaginationParams(query);
    let items = [...(this.notifications.get(userId) || [])];

    if (query.unreadOnly) {
      items = items.filter((n) => !n.read);
    }

    if (query.type) {
      const normalizedType = query.type.toLowerCase();
      items = items.filter((n) => n.type.toLowerCase() === normalizedType);
    }

    if (query.search) {
      const term = query.search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.message.toLowerCase().includes(term) ||
          (n.type?.toLowerCase().includes(term) ?? false)
      );
    }

    const sorted = items.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = sorted.length;
    const data = sorted.slice(skip, skip + limit);

    return {
      data,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findOne(userId: string, id: string): Promise<Notification> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find((n) => n.id === id);

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.findOne(userId, id);
    notification.read = true;
    return notification;
  }

  async markAllAsRead(userId: string) {
    const userNotifications = this.notifications.get(userId) || [];
    for (const notification of userNotifications) {
      notification.read = true;
    }
    return { message: "All notifications marked as read" };
  }

  async remove(userId: string, id: string): Promise<Notification> {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex((n) => n.id === id);

    if (index === -1) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return userNotifications.splice(index, 1)[0];
  }

  async getUnreadCount(userId: string) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter((n) => !n.read).length;
  }

  // Helper method to notify about leave status changes
  async notifyLeaveStatusChange(
    userId: string,
    leaveId: string,
    status: string,
    employeeName: string
  ) {
    const title = `Leave Request ${status}`;
    const message = `Your leave request for ${employeeName} has been ${status.toLowerCase()}.`;
    const type =
      status === "APPROVED"
        ? "LEAVE_APPROVED"
        : status === "REJECTED"
          ? "LEAVE_REJECTED"
          : "LEAVE_PENDING";

    return this.create({
      userId,
      title,
      message,
      type,
      link: `/leaves/${leaveId}`,
    });
  }

  // Helper method to notify about payroll generation
  async notifyPayrollGenerated(
    userId: string,
    payrollId: string,
    period: string
  ) {
    return this.create({
      userId,
      title: "Payroll Generated",
      message: `Your payroll for ${period} has been generated.`,
      type: "PAYROLL_GENERATED",
      link: `/payrolls/${payrollId}`,
    });
  }
}
