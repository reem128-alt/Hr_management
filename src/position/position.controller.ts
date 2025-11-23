import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { PositionService } from "./position.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { PositionQueryDto } from "./dto/position-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";

@ApiTags("Positions")
@ApiBearerAuth()
@Controller("positions")
@UseGuards(JwtAuthGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: "Create a new position" })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all positions" })
  findAll(@Query() query: PositionQueryDto) {
    return this.positionService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a position by ID" })
  findOne(@Param("id") id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: "Update a position" })
  update(
    @Param("id") id: string,
    @Body() updatePositionDto: UpdatePositionDto
  ) {
    return this.positionService.update(id, updatePositionDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: "Delete a position" })
  remove(@Param("id") id: string) {
    return this.positionService.remove(id);
  }
}
