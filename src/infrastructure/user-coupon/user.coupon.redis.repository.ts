import { Injectable } from '@nestjs/common';
import { IUserCouponCacheRepository } from '../../domain/user-coupon/user.coupon.cache.repository';
import {
  IUserCouponCacheFindOneOut,
  IUserCouponCacheSaveOut,
  IUserCouponCacheSetGiveUserOut,
} from '../../domain/user-coupon/user.coupon.out';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class UserCouponRedisRepository implements IUserCouponCacheRepository {
  constructor(@InjectRedis() private client: Redis) {}
  private prefixCouponId = 'coupon_id:';
  private prefixUserId = 'users';

  async findOneByCouponIdAndUserId(findOneOut: IUserCouponCacheFindOneOut) {
    const oneCoupon = await this.client.get(this.prefixCouponId + findOneOut.couponId.toString() + ':' + this.prefixUserId);

    if (!oneCoupon) {
      return false;
    }

    return true;
  }

  async save(saveOut: IUserCouponCacheSaveOut) {
    await this.client.set(
      this.prefixCouponId + saveOut.couponId.toString() + ':' + this.prefixUserId,
      saveOut.userId,
      'EX',
      saveOut.expireSecond,
    );
  }

  async setGiveUser(setGiveUserOut: IUserCouponCacheSetGiveUserOut) {
    // sadd value 가 존재하면 0
    return this.client.sadd(this.prefixCouponId + setGiveUserOut.couponId + ':' + this.prefixUserId, setGiveUserOut.userId);
  }
}
