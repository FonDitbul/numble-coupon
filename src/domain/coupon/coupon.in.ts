// server from other dependency (ex: gRPC request)

export interface CouponCreateIn {
  name: string;
  type: number;
  count: number;

  startDate: Date;
  endDate: Date;
  expireMinute: number;

  discountType: number;
  discountAmount: number;
}

export interface CouponUpdateIn extends CouponCreateIn {
  couponId: number;
}
