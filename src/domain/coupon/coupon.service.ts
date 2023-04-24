import { Coupon } from './coupon';
import { CouponCreateIn, CouponUpdateIn } from './coupon.in';

export interface ICouponService {
  findAll: () => Promise<Coupon[]>;
  create: (couponCreateIn: CouponCreateIn) => Promise<Coupon>;
  update: (couponUpdateIn: CouponUpdateIn) => Promise<Coupon>;
  delete: (couponId: number) => Promise<Coupon>;
}
