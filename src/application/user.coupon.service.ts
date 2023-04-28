import { Inject, Injectable } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';
import {
  IUserCouponDeleteIn,
  IUserCouponFindAllIn,
  IUserCouponGiveIn,
  IUserCouponUseCancelIn,
  IUserCouponUseIn,
} from '../domain/user-coupon/user.coupon.in';
import { UserCoupon } from '../domain/user-coupon/user.coupon';
import { Coupon } from '../domain/coupon/coupon';
import {
  IUserCouponFindAllOut,
  IUserCouponGiveOut,
  IUserCouponUseCancelOut,
  IUserCouponUseOut,
} from '../domain/user-coupon/user.coupon.out';
import { ICouponRepository } from '../domain/coupon/coupon.repository';
import * as dateFns from 'date-fns';

@Injectable()
export class UserCouponService implements IUserCouponService {
  constructor(
    @Inject('IUserCouponRepository') private userCouponRepository: IUserCouponRepository,
    @Inject('ICouponRepository') private couponRepository: ICouponRepository,
  ) {}

  async give(giveIn: IUserCouponGiveIn): Promise<UserCoupon> {
    const coupon = await this.couponRepository.findOneWithStockById(giveIn.couponId);

    const now = new Date();
    if (Coupon.isExistCoupon(coupon)) {
      throw new Error('존재하지 않는 쿠폰입니다.');
    }

    if (Coupon.isEndDateExpire(coupon.endDate, now)) {
      throw new Error('발급이 만료된 쿠폰입니다.');
    }

    const calCouponExpireDate = dateFns.addMinutes(now, coupon.expireMinute);
    const expireDate = coupon.endDate > calCouponExpireDate ? calCouponExpireDate : coupon.endDate;

    const userCouponGiveOut: IUserCouponGiveOut = {
      userId: giveIn.userId,
      couponId: coupon.id,
      couponNumber: coupon.count,
      giveDate: now,
      expireDate: expireDate,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
    };
    if (Coupon.isWithoutQuantityType(coupon.type)) {
      return await this.userCouponRepository.giveWithoutQuantity(userCouponGiveOut);
    }

    const couponStock = coupon.CouponsStock;

    if (couponStock.count === 0) {
      throw new Error('남은 재고가 존재하지 않습니다.');
    }

    return await this.userCouponRepository.giveWithQuantity(userCouponGiveOut);
  }

  async findAll(findAllIn: IUserCouponFindAllIn): Promise<UserCoupon[]> {
    const findAllOut: IUserCouponFindAllOut = {
      userId: findAllIn.userId,
      take: findAllIn.take,
      couponIdCursor: findAllIn.couponIdCursor,
    };
    const userCouponArray = await this.userCouponRepository.findAll(findAllOut);
    const userCouponObj = userCouponArray.map(
      (userCoupon) =>
        new UserCoupon(
          userCoupon.id,
          userCoupon.userId,
          userCoupon.couponId,
          userCoupon.couponNumber,
          userCoupon.productId,
          userCoupon.giveDate,
          userCoupon.usedDate,
          userCoupon.expireDate,
          userCoupon.discountType,
          userCoupon.discountAmount,
          userCoupon.createdAt,
          userCoupon.updatedAt,
          userCoupon.deletedAt,
          userCoupon.Coupons,
        ),
    );
    return userCouponArray;
  }

  async use(useIn: IUserCouponUseIn): Promise<UserCoupon> {
    const userCoupon = await this.userCouponRepository.findOneById(useIn.id);

    if (UserCoupon.isExistUserCoupon(userCoupon)) {
      throw new Error('존재하지 않거나 삭제된 유저 쿠폰입니다.');
    }

    if (UserCoupon.isExpire(userCoupon.expireDate)) {
      throw new Error('만료 된 쿠폰입니다.');
    }

    if (UserCoupon.isAlreadyUsed(userCoupon.productId, userCoupon.usedDate)) {
      throw new Error('이미 사용된 쿠폰입니다.');
    }

    if (useIn.userId !== userCoupon.userId) {
      throw new Error('다른 user 의 쿠폰입니다.');
    }

    if (useIn.couponId !== userCoupon.couponId) {
      throw new Error('coupon Id가 동일하지 않습니다.');
    }

    const userCouponOut: IUserCouponUseOut = {
      id: useIn.id,
      productId: useIn.productId,
      usedDate: new Date(),
    };

    return await this.userCouponRepository.use(userCouponOut);
  }
  async useCancel(useCancelIn: IUserCouponUseCancelIn): Promise<UserCoupon> {
    const userCoupon = await this.userCouponRepository.findOneById(useCancelIn.id);

    if (UserCoupon.isExistUserCoupon(userCoupon)) {
      throw new Error('존재하지 않거나 삭제된 유저 쿠폰입니다.');
    }

    if (UserCoupon.isExpire(userCoupon.expireDate)) {
      throw new Error('만료 된 쿠폰은 변경할 수 없습니다.');
    }

    if (UserCoupon.isNotUsed(userCoupon.productId, userCoupon.usedDate)) {
      throw new Error('사용되지 않은 쿠폰입니다.');
    }

    if (useCancelIn.userId !== userCoupon.userId) {
      throw new Error('다른 user 의 쿠폰입니다.');
    }

    if (useCancelIn.couponId !== userCoupon.couponId) {
      throw new Error('coupon Id가 동일하지 않습니다.');
    }

    const useCancelOut: IUserCouponUseCancelOut = {
      id: useCancelIn.id,
    };

    return await this.userCouponRepository.useCancel(useCancelOut);
  }

  async delete(deleteIn: IUserCouponDeleteIn): Promise<UserCoupon> {
    const userCoupon = await this.userCouponRepository.findOneById(deleteIn.id);

    if (UserCoupon.isExistUserCoupon(userCoupon)) {
      throw new Error('존재하지 않거나 이미 삭제된 유저 쿠폰입니다.');
    }

    if (deleteIn.userId !== userCoupon.userId) {
      throw new Error('다른 user 의 쿠폰입니다.');
    }

    if (deleteIn.couponId !== userCoupon.couponId) {
      throw new Error('coupon Id가 동일하지 않습니다.');
    }

    return await this.userCouponRepository.delete({ id: deleteIn.id });
  }
}
