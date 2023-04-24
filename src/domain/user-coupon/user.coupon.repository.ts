import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllOut } from './user.coupon.out';

export interface IUserCouponRepository {
  findAll: (findAllOut: IUserCouponFindAllOut) => Promise<UserCoupon[]>;
}
