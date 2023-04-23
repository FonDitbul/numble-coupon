import { ICouponService } from '../domain/coupon/coupon.service';
import { CouponService } from './coupon.service';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { ICouponRepository } from '../domain/coupon/coupon.repository';
import { Coupon, COUPON_PREDEFINE } from '../domain/coupon/coupon';
import { CouponCreateIn } from '../domain/coupon/coupon.in';

describe('Coupon Service test  ', () => {
  const couponRepository: MockProxy<ICouponRepository> = mock<ICouponRepository>();

  const sut: ICouponService = new CouponService(couponRepository);

  // mock clear
  beforeEach(() => {
    mockReset(couponRepository);
  });

  describe('쿠폰 생성 테스트', () => {
    describe('생성 성공 케이스 ', () => {
      test('수량이 존재하며, 할인율 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 1500,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };

        const result = await sut.create(givenCouponCreateIn);

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(1);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('수량이 존재하며, 할인 금액 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 1500,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
        };

        const result = await sut.create(givenCouponCreateIn);

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(1);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('수량이 존재하지않으며, 할인율 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };

        const result = await sut.create(givenCouponCreateIn);

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(1);
      });

      test('수량이 존재하지않으며, 할인금액 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
        };

        const result = await sut.create(givenCouponCreateIn);

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(1);
      });
    });

    describe('생성 실패 케이스', () => {
      test('존재하지 않는 수량 type 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: 3,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(new Error('type value error'));

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('존재하지 않는 discountType 일 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: 3,
          discountAmount: 5000,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(new Error('discount type value error'));

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('수량 type 이나 수량이 존재하지 않을 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(
          new Error('with quantity type 일 경우 count 는 반드시 0이상 이여야 합니다.'),
        );

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('수량이 존재하지 않으나 재고(count)가 0이 아닐 경우 ', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 15,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(
          new Error('without quantity type 일 경우 count 는 반드시 0이여야 합니다.'),
        );

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('할인 타입(discountType) 이 할인율 이나, 1~100 사이의 수가 아닌 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50000,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(new Error('discount type value error'));

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });

      test('할인 타입(discountType) 이 할인금액 이나, 음수인 경우', async () => {
        const givenCouponCreateIn: CouponCreateIn = {
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 15,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: -5,
        };

        await expect(async () => await sut.create(givenCouponCreateIn)).rejects.toThrow(new Error('discount type value error'));

        expect(couponRepository.createWithQuantity.mock.calls.length).toEqual(0);
        expect(couponRepository.createWithoutQuantity.mock.calls.length).toEqual(0);
      });
    });
  });
});
