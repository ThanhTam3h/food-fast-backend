import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const startTime = Number(request['startTime']);
    const endTime = Date.now();
    const takenTime = `${endTime - startTime}ms`;

    let status: number;
    let message: string = 'Have error';
    let error: any;

    if (exception instanceof HttpException) {
      // Lỗi http
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const exceptionResponseObj = exceptionResponse as Record<string, any>;
        message =
          exceptionResponseObj.message || exceptionResponseObj.err || 'Error';
        // Lỗi validate DTO
        if (Array.isArray(exceptionResponseObj.message)) {
          message = 'Data is invalid';
          error = exceptionResponseObj.message;
        }
      }
    } else {
      // Lỗi ngoài ý muốn
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'System is error';
      this.logger.error(exception);
    }

    const errResponse: ApiResponse<any> = {
      success: false,
      message,
      ...(error && { error }),
      date: new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false,
      }),
      path: request.url,
      takenTime,
    };
    response.status(status).json(errResponse);
  }
}
