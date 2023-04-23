import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ICouponRepository } from '../domain/coupon/coupon.repository';
import { Coupon } from '../domain/coupon/coupon';
import { CouponCreateOut } from '../domain/coupon/coupon.out';

@Injectable()
export class CouponPrismaRepository implements ICouponRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Coupon[]> {
    // const whereCondition = removeUndefinedKey({
    //   id: where.id,
    //   userId: where.userId,
    //   name: where.name,
    //   nickName: where.nickName,
    //   email: where.email,
    //   phoneNumber: where.phoneNumber,
    //   deletedAt: null,
    // });
    return await this.prisma.coupons.findMany({});
  }

  async createWithQuantity(couponCreateOut: CouponCreateOut): Promise<Coupon> {
    return await this.prisma.$transaction(async (tx) => {
      const createdCoupon = await this.prisma.coupons.create({
        data: {
          ...couponCreateOut,
        },
      });

      await this.prisma.couponsStock.create({
        data: {
          couponId: createdCoupon.id,
          count: createdCoupon.count,
        },
      });

      await this.prisma.couponsHistory.create({
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
    return await this.prisma.$transaction(async (tx) => {
      const createdCoupon = await this.prisma.coupons.create({
        data: {
          ...couponCreateOut,
        },
      });

      await this.prisma.couponsHistory.create({
        data: {
          ...couponCreateOut,
          couponId: createdCoupon.id,
          description: '최초 생성',
        },
      });

      return createdCoupon;
    });
  }

  delete(): Promise<Coupon> {
    return Promise.resolve(undefined);
  }

  update(): Promise<Coupon> {
    return Promise.resolve(undefined);
  }
}
