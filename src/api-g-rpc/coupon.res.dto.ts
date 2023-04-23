import { Coupon } from '../domain/coupon/coupon';

export interface IFindAllRes {
  coupons: Coupon[];
}

export type ICouponCreateRes = Coupon;
