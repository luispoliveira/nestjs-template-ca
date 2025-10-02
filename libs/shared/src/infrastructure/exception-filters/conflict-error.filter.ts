import { ConflicError } from '@lib/shared/core/errors/conflict-error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
@Catch(ConflicError)
export class ConflictErrorFilter implements ExceptionFilter {
  catch(exception: ConflicError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 409;

    response.status(status).send({
      statusCode: status,
      error: 'Conflict',
      message: exception.message,
    });
  }
}
