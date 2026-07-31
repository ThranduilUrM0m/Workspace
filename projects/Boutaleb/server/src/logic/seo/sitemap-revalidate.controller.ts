import { Controller, Post, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('sitemap')
export class SitemapRevalidateController {
  constructor(private readonly configService: ConfigService) {}

  @Post('revalidate')
  @HttpCode(HttpStatus.OK)
  async revalidate(@Headers('x-revalidate-secret') secret: string) {
    const expected = this.configService.get<string>('REVALIDATE_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid revalidate secret');
    }

    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const response = await fetch(`${clientUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ paths: ['/sitemap.xml'] }),
    });

    if (!response.ok) {
      throw new Error(`Sitemap revalidation failed: ${response.status}`);
    }

    return { revalidated: true };
  }
}
