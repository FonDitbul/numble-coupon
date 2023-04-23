import { Coupon } from './coupon';

export interface ICouponRepository {
  findAll: () => Promise<Coupon[]>;
}
