// server send to other dependency (ex: DB, redis other server)

export class CouponCreateOut {
  readonly name: string;
  readonly type: number;
  readonly count: number;

  readonly startDate: Date;
  readonly endDate: Date;
  readonly expireMinute: number;

  readonly discountType: number;
  readonly discountAmount: number;

  constructor(
    name: string,
    type: number,
    count: number,

    startDate: Date,
    endDate: Date,
    expireMinute: number,

    discountType: number,
    discountAmount: number,
  ) {
    this.name = name;
    this.type = type;
    this.count = count;

    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.expireMinute = expireMinute;

    this.discountType = discountType;
    this.discountAmount = discountAmount;
  }
}
