import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllOut, IUserCouponUseCancelOut, IUserCouponUseOut } from './user.coupon.out';

export interface IUserCouponRepository {
  findOneById: (id: number) => Promise<UserCoupon>;
  findAll: (findAllOut: IUserCouponFindAllOut) => Promise<UserCoupon[]>;
  use: (useOut: IUserCouponUseOut) => Promise<UserCoupon>;
  useCancel: (useCancelOut: IUserCouponUseCancelOut) => Promise<UserCoupon>;
}
