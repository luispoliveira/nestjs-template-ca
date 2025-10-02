import { NotFoundError } from '@lib/shared';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter {
  catch(exception: NotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 404;

    response.status(status).send({
      statusCode: status,
      error: 'Not Found',
      message: exception.message,
    });
  }
}
