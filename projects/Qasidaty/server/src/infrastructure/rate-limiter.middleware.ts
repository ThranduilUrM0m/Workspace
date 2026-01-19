import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private rateLimiter: RateLimiterRedis;

  constructor() {
    const redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      enableOfflineQueue: false,
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'middleware',
      points: 10, // Number of points
      duration: 1, // Per second
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.rateLimiter.consume(req.ip);
      next();
    } catch (err) {
      res.status(429).send('Too Many Requests');
    }
  }
}
