import { Injectable } from '@nestjs/common';
import { IUserCouponRepository } from '../../domain/user-coupon/user.coupon.repository';
import { PrismaService } from '../prisma/prisma.service';
import { UserCoupon } from '../../domain/user-coupon/user.coupon';

@Injectable()
export class UserCouponPrismaRepository implements IUserCouponRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserCoupon[]> {
    return [];
  }
}
