import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: 5432,
        username: 'postgres',
        password: process.env.DATABASE_PASSWORD,
        database: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    CacheModule.register({
      ttl: 10000,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: 6379,
    }),
    ScheduleModule.forRoot(),
    TasksModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ]
})
export class AppModule {}
