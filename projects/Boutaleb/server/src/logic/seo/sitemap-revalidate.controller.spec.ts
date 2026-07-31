import { UnauthorizedException } from '@nestjs/common';
import { SitemapRevalidateController } from './sitemap-revalidate.controller';

describe('SitemapRevalidateController', () => {
  const config: Record<string, string> = {
    REVALIDATE_SECRET: 'test-secret',
    CLIENT_URL: 'http://localhost:3002',
  };
  const configService = { get: (key: string) => config[key] } as any;
  let controller: SitemapRevalidateController;

  beforeEach(() => {
    controller = new SitemapRevalidateController(configService);
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it('rejects a missing secret', async () => {
    await expect(controller.revalidate(undefined as unknown as string)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong secret', async () => {
    await expect(controller.revalidate('wrong-secret')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('forwards the request to the client revalidate endpoint on a correct secret', async () => {
    const result = await controller.revalidate('test-secret');
    expect(result).toEqual({ revalidated: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3002/api/revalidate',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
