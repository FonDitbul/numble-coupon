import { UserCoupon } from './user.coupon';

export class IUserCouponService {
  findAll: () => Promise<UserCoupon[]>;
}
