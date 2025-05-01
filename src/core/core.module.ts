import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transform-response/transform-response.interceptor';
import { LoggerService } from './logger/logger.service';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { RequestMethod } from '@nestjs/common/enums';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache/cache.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
        // Development: use host/port/auth
        if (nodeEnv === 'development' || nodeEnv === 'test') {
          const host = configService.get<string>('redis.host');
          const port = configService.get<number>('redis.port');
          const username = configService.get<string>('redis.username');
          const password = configService.get<string>('redis.password');

          if (!host || !port) {
            throw new Error(
              'REDIS_HOST and REDIS_PORT must be set in development',
            );
          }

          return {
            store: redisStore,
            host,
            port,
            ...(username && { username }),
            ...(password && { password }),
            ttl: 10,
          };
        }

        // Production (or anything else): use URL
        const url = configService.get<string>('redis.url');
        if (!url) {
          throw new Error('REDIS_URL must be set in production');
        }

        return {
          store: redisStore,
          url,
          ttl: 10,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    LoggerService,
    CacheService,
  ],
  exports: [LoggerService, CacheService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
