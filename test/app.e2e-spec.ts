import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { ClientGrpcProxy, MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
import { CouponModule } from '../src/infrastructure/coupon/coupon.module';
import { UserCouponModule } from '../src/infrastructure/user-coupon/user.coupon.module';
import { TestDatabase } from './test.database.e2e';
import { Coupon, COUPON_PREDEFINE } from '../src/domain/coupon/coupon';
import * as dateFns from 'date-fns';
import { UserCoupon } from '../src/domain/user-coupon/user.coupon';

describe('AppController (e2e)', () => {
  let client: ClientGrpcProxy;
  let clientUserCouponService;
  let clientCouponService;

  const testDatabase = new TestDatabase();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CouponModule, UserCouponModule],
    }).compile();

    const app: INestMicroservice = moduleFixture.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['coupon', 'user_coupon'],
        protoPath: [
          path.join(__dirname, '../src/infrastructure/proto/coupon.proto'),
          path.join(__dirname, '../src/infrastructure/proto/user.coupon.proto'),
        ],
      },
    });

    await app.listen();

    // gRPC setting
    const clientUserCoupon: ClientGrpcProxy = app.get('USER_COUPON_PACKAGE');
    const clientCoupon: ClientGrpcProxy = app.get('COUPON_PACKAGE');
    clientUserCouponService = clientUserCoupon.getService('UserCouponService');
    clientCouponService = clientCoupon.getService('CouponService');

    // database setting
    await testDatabase.createCouponInit();
  });

  afterAll(async () => {
    await testDatabase.deleteAll();
  });

  describe('coupon test', () => {
    describe('CouponService FindAll 발급 가능 쿠폰 받아오기 ', () => {
      test('발급 쿠폰 받아오기 성공', async () => {
        const sut = await clientCouponService.FindAll().toPromise();

        for (const coupon of sut.coupons as Coupon[]) {
          expect(coupon.expireMinute).toBeGreaterThan(0);
          expect(new Date(coupon.startDate).getTime()).toBeLessThan(new Date().getTime());
          expect(new Date(coupon.endDate).getTime()).toBeGreaterThan(new Date().getTime());
        }
      });
    });

    describe('CouponService Create 쿠폰 생성 ', () => {
      test('쿠폰 생성 성공', async () => {
        const createCouponReq = {
          name: 'createdCoupon',
          type: COUPON_PREDEFINE.TYPE_WITH_QUANTITY,
          count: 50000,

          startDate: new Date().toISOString(),
          endDate: dateFns.addDays(new Date(), 7).toISOString(),
          expireMinute: 7200,

          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };
        const sut = await clientCouponService.Create(createCouponReq).toPromise();

        expect(sut.type).toEqual(COUPON_PREDEFINE.TYPE_WITH_QUANTITY);
        expect(sut.discountType).toEqual(COUPON_PREDEFINE.DISCOUNT_TYPE_RATE);
        expect(sut.expireMinute).toBeGreaterThan(0);
        expect(new Date(sut.startDate).getTime()).toBeLessThan(new Date().getTime());
        expect(new Date(sut.endDate).getTime()).toBeGreaterThan(new Date().getTime());
      });
    });

    describe('CouponService Update 쿠폰 업데이트 ', () => {
      test('쿠폰 업데이트 성공', async () => {
        const createCouponReq = {
          name: 'createdCoupon',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,

          startDate: new Date().toISOString(),
          endDate: dateFns.addDays(new Date(), 7).toISOString(),
          expireMinute: 7200,

          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };
        const createdCoupon = await clientCouponService.Create(createCouponReq).toPromise();

        const updateCouponReq = {
          couponId: createdCoupon.id,
          name: 'updatedCoupon',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,

          startDate: createdCoupon.startDate,
          endDate: createdCoupon.endDate,
          expireMinute: 7200,
          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT,
          discountAmount: 5000,
        };
        const sut = await clientCouponService.Update(updateCouponReq).toPromise();

        expect(sut.name).toEqual('updatedCoupon');
        expect(sut.discountType).toEqual(COUPON_PREDEFINE.DISCOUNT_TYPE_AMOUNT);
        expect(sut.discountAmount).toEqual(5000);
        expect(sut.expireMinute).toBeGreaterThan(0);
      });
    });

    describe('CouponService Delete 쿠폰 삭제', () => {
      test('쿠폰 삭제 성공', async () => {
        const createCouponReq = {
          name: 'willDelete',
          type: COUPON_PREDEFINE.TYPE_WITHOUT_QUANTITY,
          count: 0,

          startDate: new Date().toISOString(),
          endDate: dateFns.addDays(new Date(), 7).toISOString(),
          expireMinute: 7200,

          discountType: COUPON_PREDEFINE.DISCOUNT_TYPE_RATE,
          discountAmount: 50,
        };
        const createCoupon = await clientCouponService.Create(createCouponReq).toPromise();

        const DeleteCouponReq = {
          couponId: createCoupon.id,
        };
        const sut = await clientCouponService.Delete(DeleteCouponReq).toPromise();

        expect(sut.deletedAt).not.toBeNull();
      });
    });
  });

  describe('User Coupon test', () => {
    describe('유저 쿠폰 발급 테스트', () => {
      test('유저 수량 쿠폰 발급 성공', async () => {
        const coupon = await testDatabase.findOneByName(testDatabase.withQuantityCouponName);

        const givenUserId = 'testUserByGive';
        const givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        const sut = await clientUserCouponService.Give(giveReq).toPromise();

        expect(sut.userId).toEqual(givenUserId);
        expect(sut.couponId).toEqual(givenCouponId);
        expect(sut.productId).toBeFalsy();
        expect(sut.usedDate).toBeFalsy();
      });

      test('유저 수량 없는 쿠폰 발급 성공', async () => {
        const coupon = await testDatabase.findOneByName(testDatabase.withoutQuantityCouponName);

        const givenUserId = 'testUserByGive';
        const givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        const sut = await clientUserCouponService.Give(giveReq).toPromise();

        expect(sut.userId).toEqual(givenUserId);
        expect(sut.couponId).toEqual(givenCouponId);
        expect(sut.couponNumber).toEqual(0);
        expect(sut.couponId).toEqual(givenCouponId);
        expect(sut.productId).toBeFalsy();
        expect(sut.usedDate).toBeFalsy();
      });
    });

    describe('유저 쿠폰 읽기 테스트', () => {
      const givenUserId = 'testUserByRead';

      beforeEach(async () => {
        // default 쿠폰 발급
        const coupon = await testDatabase.findOneByName(testDatabase.withoutQuantityCouponName);
        const givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        await clientUserCouponService.Give(giveReq).toPromise();
      });

      test('유저 쿠폰 읽기 성공', async () => {
        const findAllReq = {
          userId: givenUserId,
          take: 10,
        };
        const sut = await clientUserCouponService.FindAll(findAllReq).toPromise();

        for (const userCoupon of sut.userCouponStorages as UserCoupon[]) {
          expect(userCoupon.userId).toEqual(givenUserId);
          expect(new Date(userCoupon.expireDate).getTime()).toBeGreaterThan(new Date().getTime());
          expect(userCoupon.Coupons).toBeDefined();
        }
      });
    });

    describe('유저 쿠폰 사용 테스트', () => {
      const givenUserId = 'testUserByUse';
      let givenCouponId: number;
      const givenProductId = 'testProductId';

      beforeEach(async () => {
        // default 쿠폰 발급
        const coupon = await testDatabase.findOneByName(testDatabase.withoutQuantityCouponName);
        givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        await clientUserCouponService.Give(giveReq).toPromise();
      });

      test('유저 쿠폰 사용 성공', async () => {
        const findAllReq = {
          userId: givenUserId,
          take: 10,
        };
        const findAllUserCoupon = await clientUserCouponService.FindAll(findAllReq).toPromise();

        const willUseCoupon = findAllUserCoupon.userCouponStorages.find(
          (userCoupon) => userCoupon.couponId === givenCouponId && !userCoupon.productId,
        );

        const useReq = {
          id: willUseCoupon.id,
          userId: givenUserId,
          couponId: willUseCoupon.couponId,
          productId: givenProductId,
        };

        const sut = await clientUserCouponService.Use(useReq).toPromise();
        expect(sut.userId).toEqual(givenUserId);
        expect(sut.couponId).toEqual(givenCouponId);
        expect(sut.productId).toBeTruthy();
        expect(sut.productId).toEqual(givenProductId);
        expect(sut.usedDate).toBeTruthy();
      });
    });

    describe('유저 쿠폰 사용 취소 테스트', () => {
      const givenUserId = 'testUserByUseCancel';
      let givenCouponId: number;
      const givenProductId = 'testProductId';

      beforeEach(async () => {
        // default 쿠폰 발급
        const coupon = await testDatabase.findOneByName(testDatabase.withoutQuantityCouponName);
        givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        await clientUserCouponService.Give(giveReq).toPromise();
      });

      test('유저 쿠폰 사용 취소 성공', async () => {
        const findAllReq = {
          userId: givenUserId,
          take: 10,
        };
        const findAllUserCoupon = await clientUserCouponService.FindAll(findAllReq).toPromise();

        const willUseCoupon = findAllUserCoupon.userCouponStorages.find(
          (userCoupon) => userCoupon.couponId === givenCouponId && !userCoupon.productId,
        );

        const useReq = {
          id: willUseCoupon.id,
          userId: givenUserId,
          couponId: willUseCoupon.couponId,
          productId: givenProductId,
        };

        const useUserCoupon = await clientUserCouponService.Use(useReq).toPromise();

        const useCancelReq = {
          id: willUseCoupon.id,
          userId: givenUserId,
          couponId: willUseCoupon.couponId,
        };

        // test
        const sut = await clientUserCouponService.UseCancel(useCancelReq).toPromise();
        expect(sut.productId).toBeFalsy();
        expect(sut.usedDate).toBeFalsy();
      });
    });

    describe('유저 쿠폰 삭제 테스트', () => {
      const givenUserId = 'testUserByDelete';
      let givenCouponId: number;

      beforeEach(async () => {
        // default 쿠폰 발급
        const coupon = await testDatabase.findOneByName(testDatabase.withoutQuantityCouponName);
        givenCouponId = coupon.id;

        const giveReq = {
          userId: givenUserId,
          couponId: givenCouponId,
        };
        await clientUserCouponService.Give(giveReq).toPromise();
      });

      test('유저 쿠폰 삭제 성공', async () => {
        const findAllReq = {
          userId: givenUserId,
          take: 10,
        };
        const findAllUserCoupon = await clientUserCouponService.FindAll(findAllReq).toPromise();

        const willUseCoupon = findAllUserCoupon.userCouponStorages.find(
          (userCoupon) => userCoupon.couponId === givenCouponId && !userCoupon.productId,
        );

        const deleteReq = {
          id: willUseCoupon.id,
          userId: givenUserId,
          couponId: willUseCoupon.couponId,
        };

        const sut = await clientUserCouponService.Delete(deleteReq).toPromise();

        expect(sut.deletedAt).toBeTruthy();
      });
    });
  });
});
