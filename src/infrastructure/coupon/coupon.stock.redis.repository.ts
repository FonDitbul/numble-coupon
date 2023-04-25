import { Inject, Injectable } from '@nestjs/common';
import { ICouponStockRepository } from '../../domain/coupon/coupon.stock.repository';
import { CouponStock } from '../../domain/coupon/coupon.stock';
import { ICache } from '../../domain/cache';

@Injectable()
export class CouponStockRedisRepository implements ICouponStockRepository {
  constructor(@Inject('ICache') private cache: ICache) {}

  async findOneByCouponId(couponId: number): Promise<CouponStock> {
    const couponStock = await this.cache.get('coupon_id' + couponId.toString());

    if (!couponStock) {
      return new CouponStock(0, couponId, 0, 0, new Date(), new Date());
    }

    return couponStock;
  }

  async save(couponStock: CouponStock) {
    return await this.cache.set('coupon_id' + couponStock.couponId.toString(), couponStock);
  }
}
