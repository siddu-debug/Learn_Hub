import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMe(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/bookmarks')
  @ApiOperation({ summary: 'Get my bookmarks' })
  getBookmarks(@CurrentUser() user: any) {
    return this.usersService.getBookmarks(user.id);
  }

  @Public()
  @Get(':id/profile')
  @ApiOperation({ summary: 'Get user public profile' })
  getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}
