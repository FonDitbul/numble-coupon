import { Body, Controller, Inject } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { GrpcMethod } from '@nestjs/microservices';
import { IUserCouponFindAllReq } from './user.coupon.req.dto';
import { IUserCouponFindAllRes } from './user.coupon.res.dto';

@Controller('user_coupon')
export class UserCouponController {
  constructor(@Inject('IUserCouponService') private userCouponService: IUserCouponService) {}

  @GrpcMethod('UserCouponService', 'FindAll')
  async findAll(@Body() findAllQuery: IUserCouponFindAllReq): Promise<IUserCouponFindAllRes> {
    const userCoupons = await this.userCouponService.findAll(findAllQuery);
    return { userCouponStorages: userCoupons };
  }
}
