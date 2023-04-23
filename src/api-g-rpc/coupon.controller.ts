import { Body, Controller, Inject } from '@nestjs/common';
import { CouponService } from '../application/coupon.service';
import { GrpcMethod } from '@nestjs/microservices';
import { IFindAllRes } from './coupon.res.dto';
import { Coupon } from '../domain/coupon/coupon';
import { ICouponService } from '../domain/coupon/coupon.service';

@Controller('coupon')
export class CouponController {
  constructor(
    @Inject('ICouponService') private couponService: ICouponService,
  ) {}

  @GrpcMethod('CouponService', 'FindAll')
  async findAll(): Promise<IFindAllRes> {
    const temp: Coupon[] = await this.couponService.findAll();

    return { coupons: temp };
  }
}
