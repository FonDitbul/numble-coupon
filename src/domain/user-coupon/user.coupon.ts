import { Coupon } from '../coupon/coupon';

export class UserCoupon {
  readonly id: number;
  readonly userId: string;
  readonly couponId: number;
  readonly couponNumber: number;
  readonly productId: string | null;

  readonly giveDate: Date | null;
  readonly usedDate: Date | null;
  readonly expireDate: Date | null;

  readonly discountType: number;
  readonly discountAmount: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  readonly Coupons?: Coupon;

  constructor(
    id: number,
    userId: string,
    couponId: number,
    couponNumber: number,
    productId: string | null,

    giveDate: Date | null,
    usedDate: Date | null,
    expireDate: Date | null,

    discountType: number,
    discountAmount: number,

    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,

    Coupons?: Coupon,
  ) {
    this.id = id;
    this.userId = userId;
    this.couponId = couponId;
    this.couponNumber = couponNumber;
    this.productId = productId;

    this.giveDate = giveDate;
    this.usedDate = usedDate;
    this.expireDate = expireDate;

    this.discountType = discountType;
    this.discountAmount = discountAmount;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;

    this.Coupons = Coupons;
  }
}
