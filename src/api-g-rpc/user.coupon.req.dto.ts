export interface IUserCouponFindAllReq {
  userId: string;
  take: number;
  couponIdCursor?: number;
}

export interface IUserCouponUseReq {
  id: number;
  userId: string;
  couponId: number;
  productId: string;
}

export interface IUserCouponUseCancelReq {
  id: number;
  userId: string;
  couponId: number;
}
