import { Coupon } from '../coupon/coupon';

export class UserCoupon {
  readonly id: number;
  readonly userId: string;
  readonly couponId: number;
  readonly productId: string | null;

  readonly giveDate: Date;
  readonly usedDate: Date | null;
  readonly expireDate: Date;

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
    productId: string | null,

    giveDate: Date,
    usedDate: Date | null,
    expireDate: Date,

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

  static isExistUserCoupon(userCoupon: UserCoupon) {
    return !userCoupon;
  }

  static isExpire(expireDate: Date) {
    return expireDate < new Date();
  }

  static isAlreadyUsed(productId: string | null, usedDate: Date | null): boolean {
    return !!productId || !!usedDate;
  }

  static isNotUsed(productId: string | null, usedDate: Date | null): boolean {
    return !productId || !usedDate;
  }
}
