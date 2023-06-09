import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { UserCouponService } from './user.coupon.service';
import { UserCoupon } from '../domain/user-coupon/user.coupon';
import { Coupon, COUPON_PREDEFINE } from '../domain/coupon/coupon';
import * as dateFns from 'date-fns';
import { IUserCouponDeleteIn, IUserCouponFindAllIn, IUserCouponGiveIn, IUserCouponUseCancelIn } from '../domain/user-coupon/user.coupon.in';
import { ICouponRepository } from '../domain/coupon/coupon.repository';
import { ICouponCacheRepository } from '../domain/coupon/coupon.cache.repository';
import { IUserCouponCacheRepository } from '../domain/user-coupon/user.coupon.cache.repository';

describe('User Coupon Service Test  ', () => {
  const couponRepository: MockProxy<ICouponRepository> = mock<ICouponRepository>();
  const couponCacheRepository: MockProxy<ICouponCacheRepository> = mock<ICouponCacheRepository>();
  const userCouponRepository: MockProxy<IUserCouponRepository> = mock<IUserCouponRepository>();
  const userCouponCacheRepository: MockProxy<IUserCouponCacheRepository> = mock<IUserCouponCacheRepository>();

  const sut: IUserCouponService = new UserCouponService(
    couponRepository,
    couponCacheRepository,
    userCouponRepository,
    userCouponCacheRepository,
  );

  beforeEach(() => {
    mockReset(userCouponRepository);
  });

  describe('유저의 쿠폰 발급 테스트', () => {
    describe('성공 케이스', () => {
      test('수량 제한이 없는 쿠폰 발급 성공', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,
          startDate: new Date(),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(givenCoupon);
        userCouponCacheRepository.setGiveUser.mockResolvedValue(1);

        const result = await sut.give(givenGiveIn);

        expect(userCouponRepository.giveWithoutQuantity.mock.calls.length).toBe(1);
        expect(userCouponRepository.giveWithQuantity.mock.calls.length).toBe(0);
      });

      test('수량 제한이 있는 쿠폰 발급 성공', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50,
          startDate: new Date(),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          couponStock: 1,
        };

        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(givenCoupon);
        userCouponCacheRepository.setGiveUser.mockResolvedValue(1);
        couponCacheRepository.countStock.calledWith(givenGiveIn.couponId).mockResolvedValue(10);

        const result = await sut.give(givenGiveIn);

        expect(userCouponRepository.giveWithoutQuantity.mock.calls.length).toBe(0);
        expect(userCouponRepository.giveWithQuantity.mock.calls.length).toBe(1);
      });
    });

    describe('실패 케이스', () => {
      test('쿠폰이 존재하지 않는 경우', async () => {
        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(null);

        await expect(async () => {
          await sut.give(givenGiveIn);
        }).rejects.toThrow('존재하지 않는 쿠폰입니다.');

        expect(userCouponRepository.giveWithoutQuantity.mock.calls.length).toBe(0);
        expect(userCouponRepository.giveWithQuantity.mock.calls.length).toBe(0);
      });

      test('발급 기간이 지나서 발급이 불가능한 경우', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50,
          startDate: new Date(),
          endDate: dateFns.subDays(new Date(), 7),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          couponStock: 1,
        };

        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(givenCoupon);

        await expect(async () => {
          await sut.give(givenGiveIn);
        }).rejects.toThrow('기간이 지나 발급이 불가능한 쿠폰입니다.');
      });

      test('이미 발급된 쿠폰이 존재한 경우', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50,
          startDate: new Date(),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          couponStock: 1,
        };

        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(givenCoupon);
        userCouponCacheRepository.setGiveUser.mockResolvedValue(0);

        await expect(async () => {
          await sut.give(givenGiveIn);
        }).rejects.toThrow('이미 발급된 쿠폰이 존재합니다.');
      });

      test('모든 쿠폰이 발급되어 재고가 없는 경우', async () => {
        const givenCoupon: Coupon = {
          id: 1,
          name: '테스트 쿠폰',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50,
          startDate: new Date(),
          endDate: dateFns.addDays(new Date(), 7),
          expireMinute: 6000,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          couponStock: 1,
        };

        const givenGiveIn: IUserCouponGiveIn = {
          userId: 'testUserId',
          couponId: 1,
        };

        couponCacheRepository.findOneByCouponId.calledWith(givenGiveIn.couponId).mockResolvedValue(givenCoupon);
        userCouponCacheRepository.setGiveUser.mockResolvedValue(1);
        couponCacheRepository.countStock.calledWith(givenGiveIn.couponId).mockResolvedValue(50);

        await expect(async () => {
          await sut.give(givenGiveIn);
        }).rejects.toThrow('재고가 없습니다.');
      });
    });
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
          new UserCoupon(
            1,
            'testUser',
            1,
            null,
            new Date(),
            null,
            dateFns.addDays(new Date(), 7),
            1,
            50,
            new Date(),
            new Date(),
            null,
            givenCoupon,
          ),
        ];
        const userCouponFindAllIn: IUserCouponFindAllIn = {
          userId: 'testUser',
          take: 1,
        };
        userCouponRepository.findAll.mockResolvedValue(givenUserCoupon);

        const result = await sut.findAll(userCouponFindAllIn);

        expect(result.length).toEqual(1);
      });
    });
  });

  describe('유저의 쿠폰 사용 테스트', () => {
    describe('성공 케이스', () => {
      test('유저 쿠폰 사용 성공', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          null,
          new Date(),
          null,
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(givenUserCoupon);

        const result = await sut.use(givenUserCouponUseIn);

        expect(userCouponRepository.use.mock.calls.length).toEqual(1);
      });
    });
    describe('실패 케이스', () => {
      test('존재하지 않는 쿠폰 id일 경우', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };

        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(null);

        await expect(async () => await sut.use(givenUserCouponUseIn)).rejects.toThrow(new Error('존재하지 않거나 삭제된 유저 쿠폰입니다.'));

        expect(userCouponRepository.use.mock.calls.length).toEqual(0);
      });

      test('해당 쿠폰이 만료되었을 경우', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          null,
          new Date(),
          null,
          dateFns.subDays(new Date(), 7), // 만료 날짜
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.use(givenUserCouponUseIn)).rejects.toThrow(new Error('만료 된 쿠폰입니다.'));

        expect(userCouponRepository.use.mock.calls.length).toEqual(0);
      });

      test('이미 사용된 쿠폰일 경우', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          '이미사용된쿠폰',
          new Date(),
          dateFns.subDays(new Date(), 1),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.use(givenUserCouponUseIn)).rejects.toThrow(new Error('이미 사용된 쿠폰입니다.'));

        expect(userCouponRepository.use.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 id 중, user id가 동일하지 않은 경우', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUserOther',
          2,
          null,
          new Date(),
          null,
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.use(givenUserCouponUseIn)).rejects.toThrow(new Error('다른 user 의 쿠폰입니다.'));

        expect(userCouponRepository.use.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 coupon id 중, coupon id가 동일하지 않은 경우', async () => {
        const givenUserCouponUseIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          2,
          null,
          new Date(),
          null,
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.use(givenUserCouponUseIn)).rejects.toThrow(new Error('coupon Id가 동일하지 않습니다.'));

        expect(userCouponRepository.use.mock.calls.length).toEqual(0);
      });
    });
  });

  describe('유저의 쿠폰 사용 취소 테스트', () => {
    describe('성공 케이스', () => {
      test('유저 쿠폰 사용 취소 성공', async () => {
        const givenUserCouponUseCancelIn: IUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          'already product id',
          new Date(),
          new Date(),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(givenUserCoupon);

        const result = await sut.useCancel(givenUserCouponUseCancelIn);

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(1);
      });
    });

    describe('실패 케이스', () => {
      test('존재하지 않는 쿠폰 id일 경우', async () => {
        const givenUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };

        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(null);

        await expect(async () => await sut.useCancel(givenUserCouponUseCancelIn)).rejects.toThrow(
          new Error('존재하지 않거나 삭제된 유저 쿠폰입니다.'),
        );

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(0);
      });

      test('해당 쿠폰이 만료되었을 경우', async () => {
        const givenUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          'productId',
          new Date(),
          new Date(),
          dateFns.subDays(new Date(), 7), // 만료 날짜
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.useCancel(givenUserCouponUseCancelIn)).rejects.toThrow(
          new Error('만료 된 쿠폰은 변경할 수 없습니다.'),
        );

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(0);
      });

      test('사용되지 않은 쿠폰일 경우', async () => {
        const givenUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          null,
          new Date(),
          null,
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.useCancel(givenUserCouponUseCancelIn)).rejects.toThrow(new Error('사용되지 않은 쿠폰입니다.'));

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 id 중, user id가 동일하지 않은 경우', async () => {
        const givenUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUserOther',
          2,
          'product Id',
          new Date(),
          new Date(),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.useCancel(givenUserCouponUseCancelIn)).rejects.toThrow(new Error('다른 user 의 쿠폰입니다.'));

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 coupon id 중, coupon id가 동일하지 않은 경우', async () => {
        const givenUserCouponUseCancelIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
          productId: 'test물품',
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          2,
          'productId',
          new Date(),
          new Date(),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponUseCancelIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.useCancel(givenUserCouponUseCancelIn)).rejects.toThrow(
          new Error('coupon Id가 동일하지 않습니다.'),
        );

        expect(userCouponRepository.useCancel.mock.calls.length).toEqual(0);
      });
    });
  });

  describe('유저의 쿠폰 사용 삭제 테스트', () => {
    describe('성공 케이스', () => {
      test('유저 쿠폰 사용 삭제 성공', async () => {
        const givenUserCouponDeleteIn: IUserCouponDeleteIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          1,
          null,
          new Date(),
          null,
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponDeleteIn.id).mockResolvedValue(givenUserCoupon);

        const result = await sut.delete(givenUserCouponDeleteIn);

        expect(userCouponRepository.delete.mock.calls.length).toEqual(1);
      });
    });

    describe('실패 케이스', () => {
      test('존재하지 않는 쿠폰 id일 경우', async () => {
        const givenUserCouponDeleteIn: IUserCouponDeleteIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };

        userCouponRepository.findOneById.calledWith(givenUserCouponDeleteIn.id).mockResolvedValue(null);

        await expect(async () => await sut.delete(givenUserCouponDeleteIn)).rejects.toThrow(
          new Error('존재하지 않거나 이미 삭제된 유저 쿠폰입니다.'),
        );

        expect(userCouponRepository.delete.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 id 중, user id가 동일하지 않은 경우', async () => {
        const givenUserCouponDeleteIn: IUserCouponDeleteIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUserOther',
          2,
          'product Id',
          new Date(),
          new Date(),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponDeleteIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.delete(givenUserCouponDeleteIn)).rejects.toThrow(new Error('다른 user 의 쿠폰입니다.'));

        expect(userCouponRepository.delete.mock.calls.length).toEqual(0);
      });

      test('요청받은 유저 쿠폰 coupon id 중, coupon id가 동일하지 않은 경우', async () => {
        const givenUserCouponDeleteIn: IUserCouponDeleteIn = {
          id: 1,
          userId: 'testUser',
          couponId: 1,
        };
        const givenUserCoupon = new UserCoupon(
          1,
          'testUser',
          2,
          'productId',
          new Date(),
          new Date(),
          dateFns.addDays(new Date(), 7),
          1,
          50,
          new Date(),
          new Date(),
          null,
          undefined,
        );
        userCouponRepository.findOneById.calledWith(givenUserCouponDeleteIn.id).mockResolvedValue(givenUserCoupon);

        await expect(async () => await sut.delete(givenUserCouponDeleteIn)).rejects.toThrow(new Error('coupon Id가 동일하지 않습니다.'));

        expect(userCouponRepository.delete.mock.calls.length).toEqual(0);
      });
    });
  });
});
