import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let errors: any[] = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      errors = this.extractErrors(exceptionResponse);
    }

    response.status(status).json({
      statusCode: status,
      message: 'Validation failed',
      errors: errors,
    });
  }

  private extractErrors(exceptionResponse: any): any[] {
    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message.map(this.formatError);
    } else if (typeof exceptionResponse.message === 'object') {
      return Object.entries(exceptionResponse.message).map(([key, value]) => ({
        field: key,
        messages: Array.isArray(value) ? value : [value],
      }));
    } else if (typeof exceptionResponse.message === 'string') {
      return [{ field: 'unknown', messages: [exceptionResponse.message] }];
    }
    return [{ field: 'unknown', messages: ['An unknown error occurred'] }];
  }

  private formatError(error: any): any {
    if (typeof error === 'string') {
      return { field: 'unknown', messages: [error] };
    }
    if (error.constraints) {
      return {
        field: error.property,
        messages: Object.values(error.constraints),
      };
    }
    return {
      field: error.property || 'unknown',
      messages: [error.message || 'Invalid value'],
    };
  }
}
