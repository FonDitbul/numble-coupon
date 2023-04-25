import { UserCoupon } from './user.coupon';
import { IUserCouponDeleteOut, IUserCouponFindAllOut, IUserCouponUseCancelOut, IUserCouponUseOut } from './user.coupon.out';

export interface IUserCouponRepository {
  findOneById: (id: number) => Promise<UserCoupon>;
  findAll: (findAllOut: IUserCouponFindAllOut) => Promise<UserCoupon[]>;
  use: (useOut: IUserCouponUseOut) => Promise<UserCoupon>;
  useCancel: (useCancelOut: IUserCouponUseCancelOut) => Promise<UserCoupon>;
  delete: (deleteOut: IUserCouponDeleteOut) => Promise<UserCoupon>;
}
