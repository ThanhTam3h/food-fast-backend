import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private getDefaultMessage(method: string): string {
    switch (method) {
      case 'POST':
        return 'Created successfully';
      case 'PATCH':
        return 'Updated successfully';
      case 'GET':
        return 'Taken successfully';
      case 'DELETE':
        return 'Deleted successfully';
      default:
        return 'Request is completed';
    }
  }
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Number(request["startTime"]);
    const endTime = Date.now();
    const takenTime = `${endTime - startTime}ms`;
    return next.handle().pipe(
      map((data: any) => {
        if (data && typeof data === 'object' && 'success' in data && "message" in data) {
          return data as ApiResponse<T>
        }
        let finalMessage = this.getDefaultMessage(request.method);

        if (data && typeof data === 'object' && 'message' in data) {
            finalMessage = data.message as string;

            delete data.message;
            // if (!data) {
            //     data = undefined as unknown as T;
            // }
            
            const { message, ...rest } = data;
            data = Object.keys(rest).length > 0 ? rest : undefined;
        }
          
        if (data && typeof data === 'object' && "data" in data) {
            data = data.data as T;
        }


        return {
          success: true,
          message: finalMessage,
          data,
          date: new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
          }),
          path: request.url,
          takenTime
        };
      }),
    );
  }
}
