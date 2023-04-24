import { Injectable } from '@nestjs/common';
import { IUserCouponRepository } from '../../domain/user-coupon/user.coupon.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserCoupon } from '../../domain/user-coupon/user.coupon';
import { IUserCouponFindAllOut } from '../../domain/user-coupon/user.coupon.out';

@Injectable()
export class UserCouponPrismaRepository implements IUserCouponRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(findAllOut: IUserCouponFindAllOut): Promise<UserCoupon[]> {
    return await this.prisma.userCouponsStorage.findMany({
      where: {
        AND: [{ userId: findAllOut.userId }, { expireDate: { gt: new Date() } }],
      },
      include: {
        Coupons: true,
      },
      take: findAllOut.take,
      skip: findAllOut.couponIdCursor ? 1 : 0,
      ...(findAllOut.couponIdCursor && { cursor: { id: findAllOut.couponIdCursor } }),
    });
  }
}
