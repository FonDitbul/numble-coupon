import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../api-g-rpc/app.controller';
import { AppService } from '../application/app.service';
import { LoggingInterceptor } from './common/logging.interceptor';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [CouponModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingInterceptor);
  }
}
