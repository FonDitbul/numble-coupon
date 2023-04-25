import { Coupon } from './coupon';
import { CouponCreateOut, CouponUpdateOut } from './coupon.out';

export class ICouponRepository {
  findOneById: (id: number) => Promise<Coupon>;
  findOneWithStockById: (id: number) => Promise<Coupon>;
  findAll: () => Promise<Coupon[]>;
  findAllWithStock: () => Promise<Coupon[]>;
  createWithQuantity: (couponCreateOut: CouponCreateOut) => Promise<Coupon>;
  createWithoutQuantity: (couponCreateOut: CouponCreateOut) => Promise<Coupon>;
  updateWithQuantity: (couponUpdateOut: CouponUpdateOut) => Promise<Coupon>;
  updateWithoutQuantity: (couponUpdateOut: CouponUpdateOut) => Promise<Coupon>;
  delete: (couponId: number) => Promise<Coupon>;
}
