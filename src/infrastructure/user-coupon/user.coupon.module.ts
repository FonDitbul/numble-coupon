import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UserCouponController } from '../../api-g-rpc/user.coupon.controller';
import { UserCouponService } from '../../application/user.coupon.service';
import { UserCouponPrismaRepository } from './user.coupon.prisma.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COUPON_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'user_coupon',
          protoPath: path.join(__dirname, '../proto/user.coupon.proto'),
        },
      },
    ]),
  ],
  controllers: [UserCouponController],
  providers: [
    { provide: 'IUserCouponService', useClass: UserCouponService },
    { provide: 'IUserCouponRepository', useClass: UserCouponPrismaRepository },
    PrismaService,
  ],
})
export class UserCouponModule {}
