import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ICouponRepository } from '../domain/coupon/coupon.repository';

@Injectable()
export class CouponPrismaRepository implements ICouponRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // const whereCondition = removeUndefinedKey({
    //   id: where.id,
    //   userId: where.userId,
    //   name: where.name,
    //   nickName: where.nickName,
    //   email: where.email,
    //   phoneNumber: where.phoneNumber,
    //   deletedAt: null,
    // });
    return await this.prisma.coupons.findMany({});
  }
}
