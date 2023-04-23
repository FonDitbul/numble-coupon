export interface ICouponCreateReq {
  name: string;
  type: number;
  count: number;

  startDate: Date;
  endDate: Date;
  expireMinute: number;

  discountType: number;
  discountAmount: number;
}

export interface ICouponUpdateReq extends ICouponCreateReq {
  couponId: number;
}
