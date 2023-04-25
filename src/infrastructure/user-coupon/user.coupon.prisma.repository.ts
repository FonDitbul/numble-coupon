import { Injectable } from '@nestjs/common';
import { IUserCouponRepository } from '../../domain/user-coupon/user.coupon.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserCoupon } from '../../domain/user-coupon/user.coupon';
import {
  IUserCouponDeleteOut,
  IUserCouponFindAllOut,
  IUserCouponGiveOut,
  IUserCouponUseCancelOut,
  IUserCouponUseOut,
} from '../../domain/user-coupon/user.coupon.out';

@Injectable()
export class UserCouponPrismaRepository implements IUserCouponRepository {
  constructor(private prisma: PrismaService) {}

  async findOneById(id: number): Promise<UserCoupon> {
    return await this.prisma.userCouponsStorage.findFirst({ where: { id: id, deletedAt: null } });
  }

  async giveWithoutQuantity(giveOut: IUserCouponGiveOut): Promise<UserCoupon> {
    return await this.prisma.$transaction(async (transaction) => {
      return await transaction.userCouponsStorage.create({
        data: {
          ...giveOut,
        },
      });
    });
  }

  async giveWithQuantity(giveOut: IUserCouponGiveOut): Promise<UserCoupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const couponStock = await transaction.couponsStock.findFirstOrThrow({
        where: {
          couponId: giveOut.couponId,
        },
      });

      const updatedStockCount = couponStock.count - 1;
      const stockUpdateCount = await transaction.couponsStock.update({
        data: {
          count: updatedStockCount,
          version: {
            increment: 1,
          },
        },
        where: {
          id: couponStock.id,
        },
      });

      if (couponStock.count - 1 !== stockUpdateCount.count || stockUpdateCount.count < 0) {
        throw new Error('동시성 에러');
      }

      return await transaction.userCouponsStorage.create({
        data: {
          userId: giveOut.userId,
          couponId: giveOut.couponId,
          couponNumber: stockUpdateCount.version,
          giveDate: giveOut.giveDate,
          expireDate: giveOut.expireDate,
          discountType: giveOut.discountType,
          discountAmount: giveOut.discountAmount,
        },
      });
    });
  }

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

  async use(useOut: IUserCouponUseOut): Promise<UserCoupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const usedUserCoupon = await transaction.userCouponsStorage.update({
        where: {
          id: useOut.id,
        },
        data: {
          productId: useOut.productId,
          usedDate: useOut.usedDate,
        },
      });

      await transaction.userCouponsStorageHistory.create({
        data: {
          userCouponId: useOut.id,
          productId: useOut.productId,
          usedDate: useOut.usedDate,
          description: '쿠폰 사용',
        },
      });

      return usedUserCoupon;
    });
  }

  async useCancel(useCancelOut: IUserCouponUseCancelOut): Promise<UserCoupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const useCancelUserCoupon = await transaction.userCouponsStorage.update({
        where: {
          id: useCancelOut.id,
        },
        data: {
          productId: null,
          usedDate: null,
        },
      });

      await transaction.userCouponsStorageHistory.create({
        data: {
          userCouponId: useCancelOut.id,
          productId: null,
          usedDate: null,
          description: '쿠폰 사용 취소',
        },
      });

      return useCancelUserCoupon;
    });
  }

  async delete(deleteOut: IUserCouponDeleteOut): Promise<UserCoupon> {
    return await this.prisma.userCouponsStorage.update({
      where: {
        id: deleteOut.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
