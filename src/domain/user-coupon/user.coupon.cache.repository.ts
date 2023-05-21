import { IUserCouponCacheSaveOut, IUserCouponCacheSetGiveUserOut } from './user.coupon.out';

export class IUserCouponCacheRepository {
  save: (saveOut: IUserCouponCacheSaveOut) => Promise<void>;
  setGiveUser: (setGiveUserOut: IUserCouponCacheSetGiveUserOut) => Promise<number>;
}
