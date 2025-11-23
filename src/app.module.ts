import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { CommonModule } from "./common/common.module";
import { AuthModule } from "./auth/auth.module";
import { EmployeeModule } from "./employee/employee.module";
import { DepartmentModule } from "./department/department.module";
import { PositionModule } from "./position/position.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LeaveModule } from "./leave/leave.module";
import { PayrollModule } from "./payroll/payroll.module";
import { NotificationModule } from "./notification/notification.module";
import { UserModule } from "./user/user.module";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    EmployeeModule,
    DepartmentModule,
    PositionModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    NotificationModule,
    UserModule,
    UploadModule,
  ],
})
export class AppModule {}
