import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './logic/auth/auth.module';
import { UserModule } from './logic/user/user.module';
import { WebsocketModule } from './logic/websocket/websocket.module';
import { ClusterService } from './infrastructure/cluster.service';
import { WorkerPool } from './infrastructure/worker.pool';
import { CacheService } from './infrastructure/cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    // Load .env and make ConfigService available globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Use MONGODB_URI from ConfigService; fall back to constructed URI that encodes credentials
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const explicit = configService.get<string>('MONGODB_URI')?.trim();
        if (explicit && explicit !== '') {
          console.log('[Mongoose] using explicit MONGODB_URI (not logged for security)');
          return { uri: explicit };
        }

        let user = configService.get<string>('MONGODB_USER') || '';
        let pass = configService.get<string>('MONGODB_PASS') || '';
        let host = configService.get<string>('MONGODB_HOST') || 'localhost:27017';
        const db = configService.get<string>('MONGODB_DB') || 'mydb';

        const useSrvEnv = (configService.get<string>('MONGODB_USE_SRV') || '').toString().toLowerCase();
        const hostLooksLikeAtlas = /mongodb\.net/i.test(host);
        const useSrv = useSrvEnv === 'true' || hostLooksLikeAtlas;

        // strip any accidental scheme
        host = host.replace(/^mongodb(\+srv)?:\/\//i, '');

        const protocol = useSrv ? 'mongodb+srv' : 'mongodb';
        const auth = user || pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
        let uri = `${protocol}://${auth}${host}/${db}`;

        if (useSrv && !/\?/.test(uri)) {
          uri += '?retryWrites=true&w=majority';
        }

        const masked = `${protocol}://${user ? `${user}:*****@` : ''}${host}/${db}${useSrv ? ' (SRV)' : ''}`;
        console.log('[Mongoose] connecting to', masked);

        return { uri };
      },
    }),

    // Conditional Redis store: require at runtime to avoid CJS/ESM interop issues.
    // If REDIS_HOST is not set or require fails, fallback to the default in-memory cache.
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        if (redisHost) {
          try {
            // require inside factory to avoid module interop problems during import
            const redisStore = require('cache-manager-redis-store');
            return {
              store: redisStore,
              host: redisHost,
              port: Number(configService.get('REDIS_PORT')) || 6379,
              ttl: 60 * 60, // 1 hour
            } as any;
          } catch (e) {
            // If redis store can't be loaded, fall back to memory store
            console.warn('[CacheModule] cache-manager-redis-store unavailable; falling back to memory store');
          }
        }
        return { ttl: 60 * 60 };
      },
    }),

    AuthModule,
    UserModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClusterService,
    WorkerPool,
    CacheService
  ],
})
export class AppModule {}
