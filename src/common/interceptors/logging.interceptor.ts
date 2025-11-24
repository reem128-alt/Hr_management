import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    const now = Date.now();
    
    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    if (Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }
    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);
    }
    if (Object.keys(params).length > 0) {
      this.logger.debug(`Route Params: ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;
          
          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${statusCode} - Duration: ${delay}ms`,
          );
          
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`Response Body: ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Request Error: ${method} ${url} - Duration: ${delay}ms - Error: ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
