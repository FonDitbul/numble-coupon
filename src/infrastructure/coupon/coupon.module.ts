import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CouponController } from '../../api-g-rpc/coupon.controller';
import { CouponService } from '../../application/coupon.service';
import { CouponPrismaRepository } from './coupon.prisma.repository';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import { RedisCacheModule } from '../cache/redis.module';
import { CouponStockRedisRepository } from './coupon.stock.redis.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COUPON_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'coupon',
          protoPath: path.join(__dirname, '../proto/coupon.proto'),
        },
      },
    ]),
    RedisCacheModule,
  ],
  controllers: [CouponController],
  providers: [
    { provide: 'ICouponService', useClass: CouponService },
    { provide: 'ICouponRepository', useClass: CouponPrismaRepository },
    { provide: 'ICouponStockRepository', useClass: CouponStockRedisRepository },
    PrismaService,
  ],
})
export class CouponModule {}
