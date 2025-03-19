import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';

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
    TasksModule
  ],
})
export class AppModule {}
