import { EnvironmentEnum } from '@lib/shared/core/enums/environment.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env-config.interface';

@Injectable()
export class EnvConfigService implements EnvConfig {
  constructor(private readonly _configService: ConfigService) {}

  getLogPrismaQueries(): boolean {
    return this._configService.get<boolean>('LOG_PRISMA_QUERIES', true);
  }
  getDatabaseUrl(): string {
    return this._configService.get<string>(
      'DATABASE_URL',
      'postgresql://user:password@localhost:5432/dbname',
    );
  }

  getAppPort(): number {
    return Number(this._configService.get<number>('PORT', 3000));
  }

  getNodeEnv(): EnvironmentEnum {
    return this._configService.get<EnvironmentEnum>('NODE_ENV', EnvironmentEnum.DEVELOPMENT);
  }

  getJwtSecret(): string {
    return this._configService.get<string>('JWT_SECRET', 'default_secret');
  }

  getJwtExpiresInSeconds(): number {
    return Number(this._configService.get<number>('JWT_EXPIRES_IN_SECONDS', 86400));
  }
}
