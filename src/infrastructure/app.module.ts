import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../api-g-rpc/app.controller';
import { AppService } from '../application/app.service';
import { LoggingInterceptor } from './common/logging.interceptor';
import { CouponModule } from './coupon/coupon.module';
import { UserCouponModule } from './user-coupon/user.coupon.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    CouponModule,
    UserCouponModule,
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HIST,
        port: +process.env.REDIS_PORT,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingInterceptor);
  }
}
