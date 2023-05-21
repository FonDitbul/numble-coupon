import { Injectable } from '@nestjs/common';
import { ICouponCacheRepository } from '../../domain/coupon/coupon.cache.repository';
import { Coupon } from '../../domain/coupon/coupon';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class CouponRedisRepository implements ICouponCacheRepository {
  constructor(@InjectRedis() private client: Redis) {}
  private prefixCouponId = 'coupon_id:';
  private prefixUserId = 'users';

  private transform(couponString: string): Coupon | null {
    return JSON.parse(couponString) ?? null;
  }

  async findOneByCouponId(couponId: number): Promise<any> {
    const oneCoupon = this.transform(await this.client.get(this.prefixCouponId + couponId.toString()));

    if (!oneCoupon) {
      return null;
    }

    return oneCoupon;
  }

  async create(coupon: Coupon) {
    await this.client.set(this.prefixCouponId + coupon.id.toString(), JSON.stringify(coupon), 'NX');
  }

  async countStock(couponId: number) {
    return this.client.scard(this.prefixCouponId + couponId + ':' + this.prefixUserId);
  }
}
