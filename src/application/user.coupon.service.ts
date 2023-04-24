import { Inject, Injectable } from '@nestjs/common';
import { IUserCouponService } from '../domain/user-coupon/user.coupon.service';
import { IUserCouponRepository } from '../domain/user-coupon/user.coupon.repository';

@Injectable()
export class UserCouponService implements IUserCouponService {
  constructor(@Inject('IUserCouponRepository') private userCouponRepository: IUserCouponRepository) {}

  async findAll() {
    return [];
  }
}
