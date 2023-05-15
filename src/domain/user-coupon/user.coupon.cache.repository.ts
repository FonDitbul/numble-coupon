import {
  IUserCouponCacheFindOneOut,
  IUserCouponCacheSaveOut,
  IUserCouponCacheSetGiveUserOut,
} from './user.coupon.out';

export class IUserCouponCacheRepository {
  findOneByCouponIdAndUserId: (findOneOut: IUserCouponCacheFindOneOut) => Promise<boolean>;
  save: (saveOut: IUserCouponCacheSaveOut) => Promise<void>;
  setGiveUser: (setGiveUserOut: IUserCouponCacheSetGiveUserOut) => Promise<number>;
}
