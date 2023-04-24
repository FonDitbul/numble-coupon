import { Inject, Injectable } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';
import { IUserCouponFindAllIn, IUserCouponUseIn } from '../domain/user-coupon/user.coupon.in';
import { UserCoupon } from '../domain/user-coupon/user.coupon';
import { find } from 'rxjs';
import { IUserCouponFindAllOut } from '../domain/user-coupon/user.coupon.out';

@Injectable()
export class UserCouponService implements IUserCouponService {
  constructor(@Inject('IUserCouponRepository') private userCouponRepository: IUserCouponRepository) {}

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

    const userCouponOut = {
      id: useIn.id,
      productId: useIn.productId,
      usedDate: new Date(),
    };

    return await this.userCouponRepository.use(userCouponOut);
  }
}
