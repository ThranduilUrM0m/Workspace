import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('api/public/blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('featured')
  async getFeatured(@Query('limit') limit: string = '3') {
    const posts = await this.blogService.findFeatured(Number(limit));
    return {
      data: posts,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const post = await this.blogService.findBySlug(slug);
    return {
      data: post,
      success: !!post,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getAll(
    @Query('skip') skip: string = '0',
    @Query('limit') limit: string = '10',
    @Query('tag') tag?: string,
  ) {
    let posts;
    if (tag) {
      posts = await this.blogService.findByTag(tag, Number(limit));
    } else {
      posts = await this.blogService.findAll(Number(skip), Number(limit));
    }
    return {
      data: posts,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async create(@Body() data: any) {
    const post = await this.blogService.create(data);
    return {
      data: post,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}
