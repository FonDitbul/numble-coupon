import { Test, TestingModule } from '@nestjs/testing';
import * as GRPC from '@grpc/grpc-js';
import * as ProtoLoader from '@grpc/proto-loader';
import * as request from 'supertest';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
import { CouponModule } from '../src/infrastructure/coupon/coupon.module';
import { UserCouponModule } from '../src/infrastructure/user-coupon/user.coupon.module';

describe('AppController (e2e)', () => {
  let app: INestMicroservice;
  let couponClient;
  let userCouponCliet;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CouponModule, UserCouponModule],
    }).compile();

    app = moduleFixture.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: ['coupon', 'user_coupon'],
        protoPath: [
          path.join(__dirname, '../src/infrastructure/proto/coupon.proto'),
          path.join(__dirname, '../src/infrastructure/proto/user.coupon.proto'),
        ],
      },
    });
    await app.init();

    // Load proto-buffers for test gRPC dispatch
    const proto = ProtoLoader.loadSync([
      path.join(__dirname, '../src/infrastructure/proto/coupon.proto'),
      path.join(__dirname, '../src/infrastructure/proto/user.coupon.proto'),
    ]) as any;

    // Create Raw gRPC client object
    const protoGRPC = GRPC.loadPackageDefinition(proto) as any;

    // Create client connected to started services at standard 5000 port
    couponClient = new protoGRPC.coupon.CouponService('localhost:5000', GRPC.credentials.createInsecure());
    userCouponCliet = new protoGRPC.user_coupon.UserCouponService('localhost:5000', GRPC.credentials.createInsecure());
  });

  test('GRPC test', async () => {
    const temp = couponClient.FindAll({}, (err, result) => {
      console.log('result: ', result);
      console.log(err);
    });

    expect(1).toBe(1);
  });

  test('GRPC test', async () => {
    expect(1).toBe(1);
  });
});
