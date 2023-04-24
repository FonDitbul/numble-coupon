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
