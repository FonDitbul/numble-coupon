export class CouponStock {
  id: number;
  couponId: number;
  count: number;
  version: number;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
