import { UserCoupon } from './user.coupon';
import { IUserCouponDeleteIn, IUserCouponFindAllIn, IUserCouponGiveIn, IUserCouponUseCancelIn, IUserCouponUseIn } from './user.coupon.in';

export interface IUserCouponService {
  give: (giveIn: IUserCouponGiveIn) => Promise<void>;
  findAll: (findAllIn: IUserCouponFindAllIn) => Promise<UserCoupon[]>;
  use: (useIn: IUserCouponUseIn) => Promise<UserCoupon>;
  useCancel: (useCancelIn: IUserCouponUseCancelIn) => Promise<UserCoupon>;
  delete: (deleteIn: IUserCouponDeleteIn) => Promise<UserCoupon>;
}
