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
