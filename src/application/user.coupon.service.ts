import { Inject, Injectable } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';
import { IUserCouponFindAllIn } from '../domain/user-coupon/user.coupon.in';
import { UserCoupon } from '../domain/user-coupon/user.coupon';

@Injectable()
export class UserCouponService implements IUserCouponService {
  constructor(@Inject('IUserCouponRepository') private userCouponRepository: IUserCouponRepository) {}

  async findAll(findAllIn: IUserCouponFindAllIn) {
    const userCouponArray = await this.userCouponRepository.findAll(findAllIn);
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
    return userCouponObj;
  }
}
