import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    // console.log(`${context.getClass().name}, ${context.getHandler().name}`);

    return next.handle().pipe(tap(() => console.log(`${className}.${methodName} responseTime : ${Date.now() - now}ms`)));
  }
}
