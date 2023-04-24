import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllOut, IUserCouponUseOut } from './user.coupon.out';

export interface IUserCouponRepository {
  findOneById: (id: number) => Promise<UserCoupon>;
  findAll: (findAllOut: IUserCouponFindAllOut) => Promise<UserCoupon[]>;
  use: (useOut: IUserCouponUseOut) => Promise<UserCoupon>;
}
