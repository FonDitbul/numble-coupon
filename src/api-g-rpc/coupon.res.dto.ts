import { Coupon } from '../domain/coupon/coupon';

export interface IFindAllRes {
  coupons: Coupon[];
}

export interface ICouponCreateRes extends Coupon {}

export interface ICouponUpdateRes extends Coupon {}
