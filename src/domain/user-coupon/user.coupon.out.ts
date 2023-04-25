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
