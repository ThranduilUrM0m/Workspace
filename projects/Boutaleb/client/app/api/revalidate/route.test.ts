import { NextRequest } from 'next/server';
import { POST } from './route';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { revalidatePath } = jest.requireMock('next/cache') as { revalidatePath: jest.Mock };

describe('POST /api/revalidate', () => {
  const originalSecret = process.env.REVALIDATE_SECRET;

  beforeEach(() => {
    process.env.REVALIDATE_SECRET = 'test-secret';
    revalidatePath.mockClear();
  });

  afterAll(() => {
    process.env.REVALIDATE_SECRET = originalSecret;
  });

  function makeRequest(secret: string | null, body: unknown = {}) {
    return new NextRequest('http://localhost:3002/api/revalidate', {
      method: 'POST',
      headers: secret ? { 'x-revalidate-secret': secret } : {},
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when the secret is missing', async () => {
    const response = await POST(makeRequest(null));
    expect(response.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 401 when the secret is wrong', async () => {
    const response = await POST(makeRequest('wrong-secret'));
    expect(response.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('revalidates the default path when the secret is correct and no paths given', async () => {
    const response = await POST(makeRequest('test-secret'));
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
  });

  it('revalidates each given path when the secret is correct', async () => {
    const response = await POST(makeRequest('test-secret', { paths: ['/blog', '/projects'] }));
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/blog');
    expect(revalidatePath).toHaveBeenCalledWith('/projects');
  });
});
