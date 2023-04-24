import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllIn, IUserCouponUseIn } from './user.coupon.in';

export interface IUserCouponService {
  findAll: (findAllIn: IUserCouponFindAllIn) => Promise<UserCoupon[]>;
  use: (useIn: IUserCouponUseIn) => Promise<UserCoupon>;
}
