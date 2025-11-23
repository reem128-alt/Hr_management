import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { LeaveService } from "./leave.service";
import { CreateLeaveDto } from "./dto/create-leave.dto";
import { UpdateLeaveDto } from "./dto/update-leave.dto";
import { ApproveLeaveDto } from "./dto/approve-leave.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { LeaveQueryDto } from "./dto/leave-query.dto";

@ApiTags("Leaves")
@ApiBearerAuth()
@Controller("leaves")
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiOperation({ summary: "Create a new leave request" })
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all leave requests" })
  findAll(@Query() query: LeaveQueryDto) {
    return this.leaveService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a leave request by ID" })
  findOne(@Param("id") id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a leave request" })
  update(@Param("id") id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.update(id, updateLeaveDto);
  }

  @Patch(":id/approve")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: "Approve or reject a leave request" })
  approve(@Param("id") id: string, @Body() approveLeaveDto: ApproveLeaveDto) {
    return this.leaveService.approve(id, approveLeaveDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a leave request" })
  remove(@Param("id") id: string) {
    return this.leaveService.remove(id);
  }
}
