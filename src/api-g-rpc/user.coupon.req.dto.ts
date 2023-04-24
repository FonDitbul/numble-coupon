export interface IUserCouponFindAllReq {
  userId: string;
  take: number;
  couponIdCursor?: number;
}
