import { CouponStock } from './coupon.stock';

export class ICouponStockRepository {
  findOneByCouponId: (couponId: number) => Promise<CouponStock>;
  save: (couponStock: CouponStock) => Promise<void>;
}
