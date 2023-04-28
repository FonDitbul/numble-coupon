import { UserCoupon } from './user.coupon';
import {
  IUserCouponDeleteOut,
  IUserCouponFindAllOut,
  IUserCouponGiveOut,
  IUserCouponUseCancelOut,
  IUserCouponUseOut,
} from './user.coupon.out';

export interface IUserCouponRepository {
  findOneById: (id: number) => Promise<UserCoupon>;
  findOneByCouponIdAndUserId: (couponId: number, userId: string) => Promise<UserCoupon | null>;
  giveWithoutQuantity: (giveOut: IUserCouponGiveOut) => Promise<UserCoupon>;
  giveWithQuantity: (giveOut: IUserCouponGiveOut) => Promise<UserCoupon>;
  findAll: (findAllOut: IUserCouponFindAllOut) => Promise<UserCoupon[]>;
  use: (useOut: IUserCouponUseOut) => Promise<UserCoupon>;
  useCancel: (useCancelOut: IUserCouponUseCancelOut) => Promise<UserCoupon>;
  delete: (deleteOut: IUserCouponDeleteOut) => Promise<UserCoupon>;
}
