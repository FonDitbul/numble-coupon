import { UserCoupon } from './user.coupon';
import { IUserCouponFindAllIn, IUserCouponUseCancelIn, IUserCouponUseIn } from './user.coupon.in';

export interface IUserCouponService {
  findAll: (findAllIn: IUserCouponFindAllIn) => Promise<UserCoupon[]>;
  use: (useIn: IUserCouponUseIn) => Promise<UserCoupon>;
  useCancel: (useCancelIn: IUserCouponUseCancelIn) => Promise<UserCoupon>;
}
