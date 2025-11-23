import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Patch,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Notification, NotificationService } from "./notification.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { NotificationQueryDto } from "./dto/notification-query.dto";
import { PaginatedResult } from "../common/interfaces/paginated-result.interface";

@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: "Create a notification for a user" })
  create(
    @Body() createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: "List notifications for the authenticated user" })
  findAll(
    @Request() req,
    @Query() query: NotificationQueryDto
  ): Promise<PaginatedResult<Notification>> {
    const userId = req.user.userId;
    return this.notificationService.findAll(userId, query);
  }

  @Get("count")
  @ApiOperation({ summary: "Get unread notification count for the user" })
  getUnreadCount(@Request() req) {
    const userId = req.user.userId;
    return this.notificationService.getUnreadCount(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single notification by ID" })
  findOne(@Request() req, @Param("id") id: string): Promise<Notification> {
    const userId = req.user.userId;
    return this.notificationService.findOne(userId, id);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markAsRead(@Request() req, @Param("id") id: string): Promise<Notification> {
    const userId = req.user.userId;
    return this.notificationService.markAsRead(userId, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read for the user" })
  markAllAsRead(@Request() req) {
    const userId = req.user.userId;
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  remove(@Request() req, @Param("id") id: string): Promise<Notification> {
    const userId = req.user.userId;
    return this.notificationService.remove(userId, id);
  }
}
