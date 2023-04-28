import { PrismaClient } from '@prisma/client';
import { COUPON_PREDEFINE } from '../src/domain/coupon/coupon';
import * as dateFns from 'date-fns';

export class TestDatabase {
  private prismaClient: PrismaClient;

  public withQuantityCouponName: string;
  public withoutQuantityCouponName: string;

  constructor() {
    this.prismaClient = new PrismaClient();
    this.withQuantityCouponName = 'couponWithQuantity';
    this.withoutQuantityCouponName = 'couponWithoutQuantity';
  }
  async createCouponInit() {
    const createdCoupon = await this.prismaClient.coupons.createMany({
      data: [
        {
          name: this.withQuantityCouponName,
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50000,
          startDate: dateFns.subDays(new Date(), 7),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 7200, // 5 days,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        },
        {
          name: this.withoutQuantityCouponName,
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: dateFns.subDays(new Date(), 7),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 7200, // 5 days,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        },
      ],
    });

    const quantityStock = await this.prismaClient.coupons.findFirst({
      where: {
        name: 'couponWithQuantity',
      },
    });

    await this.prismaClient.couponsStock.create({
      data: {
        couponId: quantityStock.id,
        count: quantityStock.count,
        version: 0,
      },
    });
  }

  // 전체 DB 삭제
  async deleteAll() {
    const coupon = this.prismaClient.coupons.deleteMany();
    const couponStock = this.prismaClient.couponsStock.deleteMany();
    const couponHistory = this.prismaClient.couponsHistory.deleteMany();
    const userCouponStorage = this.prismaClient.userCouponsStorage.deleteMany();
    const userCouponStorageHistory = this.prismaClient.userCouponsStorageHistory.deleteMany();

    await this.prismaClient.$transaction([coupon, couponStock, couponHistory, userCouponStorage, userCouponStorageHistory]);

    await this.prismaClient.$disconnect();
  }

  async findOneByName(name: string) {
    return await this.prismaClient.coupons.findFirst({
      where: {
        name: name,
      },
    });
  }
}
