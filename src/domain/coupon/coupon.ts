export interface Coupon {
  id: number;
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
}
