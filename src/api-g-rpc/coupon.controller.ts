import { Body, Controller, Inject } from '@nestjs/common';
import { CouponService } from '../application/coupon.service';
import { GrpcMethod } from '@nestjs/microservices';
import { ICouponCreateRes, IFindAllRes } from './coupon.res.dto';
import { Coupon } from '../domain/coupon/coupon';
import { ICouponService } from '../domain/coupon/coupon.service';
import { ICouponCreateReq } from './coupon.req.dto';

@Controller('coupon')
export class CouponController {
  constructor(@Inject('ICouponService') private couponService: ICouponService) {}

  @GrpcMethod('CouponService', 'FindAll')
  async findAll(): Promise<IFindAllRes> {
    const temp: Coupon[] = await this.couponService.findAll();

    return { coupons: temp };
  }

  @GrpcMethod('CouponService', 'Create')
  async create(@Body() createReq: ICouponCreateReq): Promise<ICouponCreateRes> {
    const temp: Coupon = await this.couponService.create(createReq);

    return temp;
  }
}
