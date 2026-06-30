import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @Get('users')
  getUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getUsers(+page, +limit);
  }

  @Put('users/:id/toggle-active')
  toggleUser(@Param('id') id: string) { return this.adminService.toggleUserActive(id); }

  @Get('courses')
  getCourses(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getCourses(+page, +limit);
  }

  @Put('courses/:id/archive')
  archiveCourse(@Param('id') id: string) { return this.adminService.archiveCourse(id); }
}
