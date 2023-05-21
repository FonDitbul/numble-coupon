import { Coupon } from './coupon';

export class ICouponCacheRepository {
  findOneByCouponId: (couponId: number) => Promise<Coupon | null>;
  countStock: (couponId: number) => Promise<number>;
  create: (coupon: Coupon) => Promise<void>;
}
