import { Coupon } from './coupon';
import { CouponCreateOut } from './coupon.out';

export class ICouponRepository {
  findAll: () => Promise<Coupon[]>;
  createWithQuantity: (couponCreateOut: CouponCreateOut) => Promise<Coupon>;
  createWithoutQuantity: (couponCreateOut: CouponCreateOut) => Promise<Coupon>;
  update: () => Promise<Coupon>;
  delete: () => Promise<Coupon>;
}
