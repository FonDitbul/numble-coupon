import { Coupon } from './coupon';
import { CouponCreateIn } from './coupon.in';

export interface ICouponService {
  findAll: () => Promise<Coupon[]>;
  create: (couponCreateIn: CouponCreateIn) => Promise<Coupon>;
  update: () => Promise<Coupon>;
  delete: () => Promise<Coupon>;
}
