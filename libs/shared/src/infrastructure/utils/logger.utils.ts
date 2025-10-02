import { Prisma } from '@generated/prisma/client';
import { EnvironmentEnum } from '@lib/shared/core/enums/environment.enum';
import { LogLevel } from '@nestjs/common';

export class LoggerUtils {
  static getLogger(environment: EnvironmentEnum): LogLevel[] {
    const logger: LogLevel[] = ['error', 'warn'];

    switch (environment) {
      case EnvironmentEnum.DEVELOPMENT:
        logger.push('log', 'debug', 'verbose');
        break;
      case EnvironmentEnum.TEST:
        logger.push('log');
        break;
      case EnvironmentEnum.PRODUCTION:
        break;
      default:
        logger.push('log', 'debug', 'verbose');
        break;
    }

    return logger;
  }

  static getPrismaLogger(environment: EnvironmentEnum): Prisma.LogLevel[] {
    const logger: Prisma.LogLevel[] = ['error', 'warn'];

    switch (environment) {
      case EnvironmentEnum.DEVELOPMENT:
        logger.push('info', 'query');
        break;
      case EnvironmentEnum.TEST:
        logger.push('info');
        break;
      case EnvironmentEnum.PRODUCTION:
        break;
      default:
        logger.push('info', 'query');
        break;
    }

    return logger;
  }
}
