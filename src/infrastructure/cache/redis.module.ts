import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { RedisModule } from '@liaoliaots/nestjs-redis';

dotenv.config();

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HIST,
        port: +process.env.REDIS_PORT,
      },
    }),
  ],
})
export class RedisCacheModule {}
