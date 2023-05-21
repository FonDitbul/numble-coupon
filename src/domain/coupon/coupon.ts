export class Coupon {
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

  couponStock?: number;

  static isExistCoupon(coupon: Coupon) {
    return !coupon;
  }

  static isValidDiscountType(discountType: number, discountAmount: number) {
    if (![COUPON_PREDEFINE.DISCOUNT_TYPE_RATE, COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT].includes(discountType)) {
      return false;
    }
    if ((discountAmount < 0 || discountAmount) > 100 && discountType === COUPON_PREDEFINE.DISCOUNT_TYPE_RATE) {
      return false;
    }

    if (discountAmount < 0 && discountType === COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT) {
      return false;
    }

    return true;
  }

  static isValidQuantityType(type: number) {
    if (![COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY, COUPON_PREDEFINE.TYPE_WITH_QUANTITY].includes(type)) {
      return false;
    }
    return true;
  }

  static isWithoutQuantityType(type: number) {
    return type === COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY;
  }

  static isValidWithoutQuantityTypeCount(count: number) {
    return count === 0;
  }

  static isValidWithQuantityTypeCount(count: number) {
    return count > 0;
  }

  static isEndDateExpire(endDate: Date, now: Date) {
    return endDate < now;
  }
}

export const COUPON_PREDEFINE = {
  TYPE_WITH_QUANTITY: 1, // 수량이 있음
  TYPE_WITHOUT_QUANTITY: 2, //수량이 없음

  DISCOUNT_TYPE_RATE: 1, // 할인율
  DISCOUNT_TYPE_AMOUNT: 2, // 절대적인 금액 할인
};
