import { Body, Controller, Inject } from '@nestjs/common';
import { CouponService } from '../application/coupon.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Coupon } from '../domain/coupon/coupon';
import { ICouponService } from '../domain/coupon/coupon.service';
import { ICouponCreateReq, ICouponDeleteReq, ICouponUpdateReq } from './coupon.req.dto';
import { ICouponCreateRes, ICouponDeleteRes, ICouponUpdateRes, IFindAllRes } from './coupon.res.dto';

@Controller('coupon')
export class CouponController {
  constructor(@Inject('ICouponService') private couponService: ICouponService) {}

  @GrpcMethod('CouponService', 'FindAll')
  async findAll(): Promise<IFindAllRes> {
    const coupons: Coupon[] = await this.couponService.findAll();

    return { coupons };
  }

  @GrpcMethod('CouponService', 'Create')
  async create(@Body() createReq: ICouponCreateReq): Promise<ICouponCreateRes> {
    return await this.couponService.create(createReq);
  }

  @GrpcMethod('CouponService', 'Update')
  async update(@Body() updateReq: ICouponUpdateReq): Promise<ICouponUpdateRes> {
    return await this.couponService.update(updateReq);
  }

  @GrpcMethod('CouponService', 'Delete')
  async delete(@Body() couponDeleteReq: ICouponDeleteReq): Promise<ICouponDeleteRes> {
    return await this.couponService.delete(couponDeleteReq.couponId);
  }
}
