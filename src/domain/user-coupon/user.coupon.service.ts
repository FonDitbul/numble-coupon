import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllIn } from './user.coupon.in';

export interface IUserCouponService {
  findAll: (findAllIn: IUserCouponFindAllIn) => Promise<UserCoupon[]>;
}
