import { UserCoupon } from '../domain/user-coupon/user.coupon';

export interface IUserCouponGiveRes extends UserCoupon {}
export interface IUserCouponFindAllRes {
  userCouponStorages: UserCoupon[];
}

export interface IUserCouponUseRes extends UserCoupon {}

export interface IUserCouponUseCancelRes extends UserCoupon {}

export interface IUserCouponDeleteRes extends UserCoupon {}
