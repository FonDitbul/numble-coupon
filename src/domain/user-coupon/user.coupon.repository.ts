import { UserCoupon } from './user.coupon';

export class IUserCouponRepository {
  findAll: () => Promise<UserCoupon[]>;
}
