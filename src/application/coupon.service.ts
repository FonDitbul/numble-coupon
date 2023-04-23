import { Inject, Injectable } from '@nestjs/common';
import { ICouponService } from '../domain/coupon/coupon.service';
import { ICouponRepository } from '../domain/coupon/coupon.repository';

@Injectable()
export class CouponService implements ICouponService {
  constructor(
    @Inject('ICouponRepository') private couponRepository: ICouponRepository,
  ) {}
  async findAll() {
    return await this.couponRepository.findAll();
  }
}
