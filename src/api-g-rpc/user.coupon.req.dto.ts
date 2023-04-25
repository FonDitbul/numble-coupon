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

export interface IUserCouponDeleteReq {
  id: number;
  userId: string;
  couponId: number;
}
