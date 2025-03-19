import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: 5432,
        username: 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        database: 'postgres',
        autoLoadEntities: true,
        synchronize: true,
      }),
    })
  ],
})
export class AppModule {}
