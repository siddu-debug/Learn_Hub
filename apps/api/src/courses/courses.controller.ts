import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  create(@CurrentUser() user: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.id, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all published courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('mine')
  @ApiOperation({ summary: 'Get my courses' })
  findMine(@CurrentUser() user: any) {
    return this.coursesService.findMyCourses(user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, user.id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a course' })
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.publish(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.delete(id, user.id);
  }

  @Post(':id/fork')
  @ApiOperation({ summary: 'Fork a course' })
  fork(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.fork(id, user.id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history' })
  getVersions(@Param('id') id: string) {
    return this.coursesService.getVersions(id);
  }

  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark' })
  toggleBookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.toggleBookmark(user.id, id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle like' })
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.toggleLike(user.id, id);
  }
}
