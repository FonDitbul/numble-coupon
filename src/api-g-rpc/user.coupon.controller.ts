import { Body, Controller, Inject } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { GrpcMethod } from '@nestjs/microservices';
import { IUserCouponFindAllReq, IUserCouponUseReq } from './user.coupon.req.dto';
import { IUserCouponFindAllRes, IUserCouponUseRes } from './user.coupon.res.dto';

@Controller('user_coupon')
export class UserCouponController {
  constructor(@Inject('IUserCouponService') private userCouponService: IUserCouponService) {}

  @GrpcMethod('UserCouponService', 'FindAll')
  async findAll(@Body() findAllQuery: IUserCouponFindAllReq): Promise<IUserCouponFindAllRes> {
    const userCoupons = await this.userCouponService.findAll(findAllQuery);
    return { userCouponStorages: userCoupons };
  }

  @GrpcMethod('UserCouponService', 'Use')
  async use(@Body() useReq: IUserCouponUseReq): Promise<IUserCouponUseRes> {
    const userCoupon = await this.userCouponService.use(useReq);

    return userCoupon;
  }
}
