import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CouponController } from '../../api-g-rpc/coupon.controller';
import { CouponService } from '../../application/coupon.service';
import { CouponPrismaRepository } from './coupon.prisma.repository';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import { CouponRedisRepository } from './coupon.redis.repository';

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
  ],
  controllers: [CouponController],
  providers: [
    { provide: 'ICouponService', useClass: CouponService },
    { provide: 'ICouponRepository', useClass: CouponPrismaRepository },
    { provide: 'ICouponCacheRepository', useClass: CouponRedisRepository },
    PrismaService,
  ],
})
export class CouponModule {}
