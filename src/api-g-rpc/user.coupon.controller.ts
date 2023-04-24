import { Controller, Inject } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { UserCoupon } from '../domain/user-coupon/user.coupon';

@Controller('user_coupon')
export class UserCouponController {
  constructor(@Inject('IUserCouponService') private userCouponService: IUserCouponService) {}

  async findAll(): Promise<UserCoupon[]> {
    return await this.userCouponService.findAll();
  }
}
