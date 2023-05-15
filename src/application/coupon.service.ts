import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ICouponService } from '../domain/coupon/coupon.service';
import { ICouponRepository } from '../domain/coupon/coupon.repository';
import { Coupon, COUPON_PREDEFINE } from '../domain/coupon/coupon';
import { CouponCreateIn, CouponUpdateIn } from '../domain/coupon/coupon.in';
import { CouponCreateOut, CouponUpdateOut } from '../domain/coupon/coupon.out';
import { ICouponCacheRepository } from '../domain/coupon/coupon.cache.repository';
import * as dateFns from 'date-fns';
@Injectable()
export class CouponService implements ICouponService {
  constructor(
    @Inject('ICouponRepository') private couponRepository: ICouponRepository,
    @Inject('ICouponCacheRepository') private couponCacheRepository: ICouponCacheRepository,
  ) {}

  async findAll(): Promise<Coupon[]> {
    const couponArray = await this.couponRepository.findAll();

    const resultCoupon: Coupon[] = [];

    for (const coupon of couponArray) {
      if (coupon.type !== COUPON_PREDEFINE.TYPE_WITH_QUANTITY) {
        resultCoupon.push({
          ...coupon,
        });
        continue;
      }

      const couponStock = await this.couponCacheRepository.countStock(coupon.id);
      resultCoupon.push({
        ...coupon,
        couponStock: couponStock,
      });
    }
    return resultCoupon;
  }

  async create(couponCreateIn: CouponCreateIn): Promise<Coupon> {
    const type = couponCreateIn.type;
    const count = couponCreateIn.count;
    const discountType = couponCreateIn.discountType;
    const discountAmount = couponCreateIn.discountAmount;

    const couponCreateOut = new CouponCreateOut(
      couponCreateIn.name,
      type,
      count,
      couponCreateIn.startDate,
      couponCreateIn.endDate,
      couponCreateIn.expireMinute,
      discountType,
      discountAmount,
    );

    if (!Coupon.isValidDiscountType(discountType, discountAmount)) {
      throw new Error('discount type value error');
    }

    if (!Coupon.isValidQuantityType(type)) {
      throw new Error('type value error');
    }

    if (Coupon.isWithoutQuantityType(type)) {
      if (!Coupon.isValidWithoutQuantityTypeCount(count)) {
        throw new Error('without quantity type 일 경우 count 는 반드시 0이여야 합니다.');
      }
      const coupon = await this.couponRepository.createWithoutQuantity(couponCreateOut);
      await this.couponCacheRepository.create(coupon);
      return coupon;
    }

    if (!Coupon.isValidWithQuantityTypeCount(count)) {
      throw new Error('with quantity type 일 경우 count 는 반드시 0이상 이여야 합니다.');
    }

    const coupon = await this.couponRepository.createWithQuantity(couponCreateOut);
    coupon.couponStock = coupon.count;

    await this.couponCacheRepository.create(coupon);

    return coupon;
  }

  async update(couponUpdateIn: CouponUpdateIn): Promise<Coupon> {
    const couponId = couponUpdateIn.couponId;
    const discountType = couponUpdateIn.discountType;
    const discountAmount = couponUpdateIn.discountAmount;

    const type = couponUpdateIn.type;
    const count = couponUpdateIn.count;
    const couponUpdateOut = new CouponUpdateOut(
      couponUpdateIn.name,
      type,
      count,

      couponUpdateIn.startDate,
      couponUpdateIn.endDate,
      couponUpdateIn.expireMinute,

      discountType,
      discountAmount,
      couponId,
    );
    const beforeCoupon = await this.couponRepository.findOneById(couponId);

    if (Coupon.isExistCoupon(beforeCoupon)) {
      throw new Error('존재하지 않는 쿠폰 ID 입니다.');
    }

    if (beforeCoupon.type !== type) {
      throw new Error('type 은 변경할 수 없습니다.');
    }

    if (!Coupon.isValidDiscountType(discountType, discountAmount)) {
      throw new Error('discount type value error');
    }

    if (!Coupon.isValidQuantityType(type)) {
      throw new Error('type value error');
    }

    if (Coupon.isWithoutQuantityType(type)) {
      if (!Coupon.isValidWithoutQuantityTypeCount(count)) {
        throw new Error('without quantity type 일 경우 count 는 반드시 0이여야 합니다.');
      }
      const updatedCoupon = await this.couponRepository.updateWithoutQuantity(couponUpdateOut);
      await this.couponCacheRepository.create(updatedCoupon);

      return updatedCoupon;
    }

    if (!Coupon.isValidWithQuantityTypeCount(count)) {
      throw new Error('with quantity type 일 경우 count 는 반드시 0이상 이여야 합니다.');
    }

    const updatedCoupon = await this.couponRepository.updateWithQuantity(couponUpdateOut);
    await this.couponCacheRepository.create(updatedCoupon);

    return updatedCoupon;
  }

  async delete(couponId: number): Promise<Coupon> {
    const deletedCoupon = await this.couponRepository.findOneById(couponId);

    if (Coupon.isExistCoupon(deletedCoupon)) {
      throw new Error('존재하지 않거나 이미 삭제된 쿠폰 ID 입니다.');
    }

    return await this.couponRepository.delete(couponId);
  }
}
