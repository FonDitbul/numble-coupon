export class CouponStock {
  id: number;
  couponId: number;
  count: number;
  version: number;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    id: number,
    couponId: number,
    count: number,
    version: number,

    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date | null,
  ) {
    this.id = id;
    this.couponId = couponId;
    this.count = count;
    this.version = version;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt ?? null;
  }
}
