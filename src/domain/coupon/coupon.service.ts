import { Coupon } from './coupon';

export interface ICouponService {
  findAll: () => Promise<Coupon[]>;
}
