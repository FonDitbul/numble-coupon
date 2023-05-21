export interface IUserCouponGiveOut {
  userId: string;
  couponId: number;
  couponNumber: number;
  giveDate: Date;
  expireDate: Date;
  discountType: number;
  discountAmount: number;
}

export interface IUserCouponFindAllOut {
  userId: string;
  take: number;
  couponIdCursor?: number;
}

export interface IUserCouponUseOut {
  id: number;
  productId: string;
  usedDate: Date;
}

export interface IUserCouponUseCancelOut {
  id: number;
}

export interface IUserCouponDeleteOut {
  id: number;
}

export interface IUserCouponCacheFindOneOut {
  couponId: number;
  userId: string;
}

export interface IUserCouponCacheSaveOut {
  couponId: number;
  userId: string;
  expireSecond: number;
}

export interface IUserCouponCacheSetGiveUserOut {
  couponId: number;
  userId: string;
}
