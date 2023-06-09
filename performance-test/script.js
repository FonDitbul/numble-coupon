import grpc from 'k6/net/grpc';
import { group, check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const client = new grpc.Client();
client.load(['proto'], 'coupon.proto', 'user.coupon.proto');

const requestPerGive = new Counter('request_per_give');
const responsePerGive = new Counter('response_per_give');

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 400 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 600 },
    { duration: '30s', target: 700 },
    { duration: '30s', target: 800 },
    { duration: '30s', target: 900 },
    { duration: '30s', target: 1000 },
    { duration: '30s', target: 900 },
    { duration: '30s', target: 800 },
    { duration: '30s', target: 700 },
    { duration: '30s', target: 600 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 400 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 100 },
  ],
};

export default () => {
  client.connect('localhost:5000', {
    plaintext: true,
  });

  // // 유저의 쿠폰 읽기
  // group('유저의 쿠폰 읽기', () => {
  //   const randUser_0_100 = Math.floor(Math.random() * 101);
  //   const userId = `user_${randUser_0_100}`;
  //
  //   const data = {
  //     userId: userId,
  //     take: 10,
  //   };
  //
  //   const couponArrayResponse = client.invoke('user_coupon.UserCouponService/FindAll', data);
  // });
  //
  // // 유저의 쿠폰 사용하기
  // group('유저의 쿠폰 사용하기', () => {
  //   const randUser_0_100 = Math.floor(Math.random() * 101);
  //   const userId = `user_${randUser_0_100}`;
  //   const randProduct_0_100 = Math.floor(Math.random() * 101);
  //   const productId = `product_${randProduct_0_100}`;
  //
  //   const data = {
  //     userId: userId,
  //     take: 10,
  //   };
  //
  //   const userCouponArrayResponse = client.invoke('user_coupon.UserCouponService/FindAll', data);
  //
  //   if (userCouponArrayResponse.message.userCouponStorages.length > 0) {
  //     const oneUserCoupon = userCouponArrayResponse.message.userCouponStorages[0];
  //     const useData = {
  //       id: oneUserCoupon.id,
  //       userId: userId,
  //       couponId: oneUserCoupon.couponId,
  //       productId: productId,
  //     };
  //
  //     const couponArrayResponse = client.invoke('user_coupon.UserCouponService/Use', useData);
  //   }
  // });
  //
  // group('유저의 쿠폰 수량 X 발급 받기', () => {
  //   const couponArrayResponse = client.invoke('coupon.CouponService/FindAll', {});
  //
  //   const oneCoupon = couponArrayResponse.message.coupons.find((coupon) => coupon.type == 2); // 수량 x 쿠폰인 경우
  //
  //   const randUser_0_100 = Math.floor(Math.random() * 101);
  //   const userId = `user_${randUser_0_100}`;
  //
  //   const data = {
  //     userId: userId,
  //     couponId: oneCoupon.id,
  //   };
  //
  //   const couponGiveRes = client.invoke('user_coupon.UserCouponService/Give', data);
  //
  //   requestPerGive.add(1);
  //   check(couponGiveRes, {
  //     'status is OK': (r) => r && r.status === grpc.StatusOK,
  //   });
  //
  //   if (couponGiveRes.status == 0) {
  //     responsePerGive.add(1);
  //   }
  // });

  group('유저의 쿠폰 수량 발급 받기', () => {
    const randUser_0_100 = Math.floor(Math.random() * 100);
    const userId = `user_${randUser_0_100}`;

    const data = {
      userId: userId,
      couponId: 1,
    };

    const couponGiveRes = client.invoke('user_coupon.UserCouponService/Give', data);

    requestPerGive.add(1);
    check(couponGiveRes, {
      'status is OK': (r) => r && r.status === grpc.StatusOK,
    });

    if (couponGiveRes.status == 0) {
      responsePerGive.add(1);
    }
  });

  client.close();
  sleep(1);
};
