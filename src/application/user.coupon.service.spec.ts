import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { UserCouponService } from './user.coupon.service';
import { UserCoupon } from '../domain/user-coupon/user.coupon';
import { Coupon, COUPON_PREDEFINE } from '../domain/coupon/coupon';

describe('User Coupon Service Test  ', () => {
  const userCouponRepository: MockProxy<IUserCouponRepository> = mock<IUserCouponRepository>();

  const sut: IUserCouponService = new UserCouponService(userCouponRepository);

  beforeEach(() => {
    mockReset(userCouponRepository);
  });

  describe('유저의 쿠폰 불러오기 테스트', () => {
    describe('성공 케이스', () => {
      test('유저 쿠폰 불러오기 성공', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50,
          startDate: new Date(),
          endDate: new Date(),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        const givenUserCoupon = [
          new UserCoupon(1, 'testUser', 1, 1, 'testProduct', null, null, new Date(), 1, 50, new Date(), new Date(), null, givenCoupon),
        ];
        const userCouponFindAllIn = {
          userId: 'testUser',
          take: 1,
        };
        userCouponRepository.findAll.calledWith(userCouponFindAllIn).mockResolvedValue(givenUserCoupon);

        const result = await sut.findAll(userCouponFindAllIn);

        expect(result.length).toEqual(1);
      });
    });
  });
});
