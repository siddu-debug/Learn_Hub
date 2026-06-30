import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Search')
@Public()
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search courses' })
  search(
    @Query('q') q: string,
    @Query('tag') tag?: string,
    @Query('difficulty') difficulty?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    return this.searchService.search(q, { tag, difficulty, creatorId });
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  getTags() {
    return this.searchService.getTags();
  }
}
