export interface IUserCouponGiveIn {
  userId: string;
  couponId: number;
}
export interface IUserCouponFindAllIn {
  userId: string;
  take: number;
  couponIdCursor?: number;
}

export interface IUserCouponUseIn {
  id: number;
  userId: string;
  couponId: number;
  productId: string;
}

export interface IUserCouponUseCancelIn {
  id: number;
  userId: string;
  couponId: number;
}

export interface IUserCouponDeleteIn {
  id: number;
  userId: string;
  couponId: number;
}
