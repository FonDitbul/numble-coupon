import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as path from 'path';
import { LoggingInterceptor } from './infrastructure/common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'coupon',
        protoPath: [
          path.join(__dirname, 'infrastructure/proto/coupon.proto'),
          path.join(__dirname, 'infrastructure/proto/user.coupon.proto'),
        ],
      },
    },
  );

  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen();
}
bootstrap();
