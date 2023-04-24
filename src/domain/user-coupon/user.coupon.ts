import { Coupon } from '../coupon/coupon';

export class UserCoupon {
  id: number;
  userId: string;
  couponId: number;
  couponNumber: number;
  productId: string | null;

  giveDate: Date | null;
  usedDate: Date | null;
  expireDate: Date | null;

  name: string;
  type: number;
  count: number;

  startDate: Date;
  endDate: Date;
  expireMinute: number;

  discountType: number;
  discountAmount: number;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  Coupon?: Coupon;
}
