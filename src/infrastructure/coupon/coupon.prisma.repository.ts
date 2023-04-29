import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICouponRepository } from '../../domain/coupon/coupon.repository';
import { Coupon, COUPON_PREDEFINE } from '../../domain/coupon/coupon';
import { CouponCreateOut, CouponUpdateOut } from '../../domain/coupon/coupon.out';

@Injectable()
export class CouponPrismaRepository implements ICouponRepository {
  constructor(private prisma: PrismaService) {}

  async findOneById(id: number): Promise<Coupon> {
    return await this.prisma.coupons.findFirst({ where: { id: id, deletedAt: null } });
  }

  async findOneWithStockById(id: number): Promise<Coupon> {
    return await this.prisma.coupons.findFirst({
      where: { id: id, deletedAt: null },
      include: {
        CouponsStock: true,
      },
    });
  }

  async findAll(): Promise<Coupon[]> {
    return await this.prisma.coupons.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findAllWithStock(): Promise<Coupon[]> {
    return await this.prisma.coupons.findMany({
      where: {
        type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
        endDate: {
          gt: new Date(),
        },
        deletedAt: null,
      },
      include: {
        CouponsStock: true,
      },
    });
  }

  async createWithQuantity(couponCreateOut: CouponCreateOut): Promise<Coupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const createdCoupon = await transaction.coupons.create({
        data: {
          ...couponCreateOut,
        },
      });

      await transaction.couponsStock.create({
        data: {
          couponId: createdCoupon.id,
          count: createdCoupon.count,
          version: 0,
        },
      });

      await transaction.couponsHistory.create({
        data: {
          ...couponCreateOut,
          couponId: createdCoupon.id,
          description: '최초 생성',
        },
      });

      return createdCoupon;
    });
  }

  async createWithoutQuantity(couponCreateOut: CouponCreateOut): Promise<Coupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const createdCoupon = await transaction.coupons.create({
        data: {
          ...couponCreateOut,
        },
      });

      await transaction.couponsHistory.create({
        data: {
          ...couponCreateOut,
          couponId: createdCoupon.id,
          description: '최초 생성',
        },
      });

      return createdCoupon;
    });
  }

  async updateWithoutQuantity(couponUpdateOut: CouponUpdateOut): Promise<Coupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const updatedCoupon = await transaction.coupons.update({
        where: {
          id: couponUpdateOut.couponId,
        },
        data: {
          name: couponUpdateOut.name,
          startDate: couponUpdateOut.startDate,
          endDate: couponUpdateOut.endDate,
          expireMinute: couponUpdateOut.expireMinute,
          discountType: couponUpdateOut.discountType,
          discountAmount: couponUpdateOut.discountAmount,
        },
      });

      await transaction.couponsHistory.create({
        data: {
          ...couponUpdateOut,
          description: '쿠폰 업데이트',
        },
      });

      return updatedCoupon;
    });
  }

  async updateWithQuantity(couponUpdateOut: CouponUpdateOut): Promise<Coupon> {
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const beforeCouponStock = await transaction.couponsStock.findFirstOrThrow({
            select: { id: true, count: true },
            where: {
              couponId: couponUpdateOut.couponId,
            },
          });

          const sumCount = beforeCouponStock.count + couponUpdateOut.count;

          const updatedCoupon = await transaction.coupons.update({
            where: {
              id: couponUpdateOut.couponId,
            },
            data: {
              name: couponUpdateOut.name,
              count: sumCount,
              startDate: couponUpdateOut.startDate,
              endDate: couponUpdateOut.endDate,
              expireMinute: couponUpdateOut.expireMinute,
              discountType: couponUpdateOut.discountType,
              discountAmount: couponUpdateOut.discountAmount,
            },
          });

          await transaction.couponsStock.update({
            where: {
              id: beforeCouponStock.id,
            },
            data: {
              count: sumCount,
            },
          });

          await transaction.couponsHistory.create({
            data: {
              couponId: couponUpdateOut.couponId,
              name: couponUpdateOut.name,
              type: couponUpdateOut.type,
              count: sumCount,
              startDate: couponUpdateOut.startDate,
              endDate: couponUpdateOut.endDate,
              expireMinute: couponUpdateOut.expireMinute,
              discountType: couponUpdateOut.discountType,
              discountAmount: couponUpdateOut.discountAmount,
              description: '쿠폰 업데이트',
            },
          });

          return updatedCoupon;
        },
        {
          maxWait: 5000, // default: 2000
          timeout: 10000, // default: 5000
        },
      );
    } catch (e) {
      this.prisma.$disconnect();
      throw e;
    }
  }

  async delete(couponId: number): Promise<Coupon> {
    return await this.prisma.$transaction(async (transaction) => {
      const deletedCoupon = await transaction.coupons.update({
        where: {
          id: couponId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      if (deletedCoupon.type === COUPON_PREDEFINE.TYPE_WITH_QUANTITY) {
        await transaction.couponsStock.update({
          where: {
            couponId: couponId,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      await transaction.couponsHistory.create({
        data: {
          couponId: deletedCoupon.id,
          name: deletedCoupon.name,
          type: deletedCoupon.type,
          count: deletedCoupon.count,
          startDate: deletedCoupon.startDate,
          endDate: deletedCoupon.endDate,
          expireMinute: deletedCoupon.expireMinute,
          discountType: deletedCoupon.discountType,
          discountAmount: deletedCoupon.discountAmount,
          description: '쿠폰 삭제',
        },
      });
      return deletedCoupon;
    });
  }
}
