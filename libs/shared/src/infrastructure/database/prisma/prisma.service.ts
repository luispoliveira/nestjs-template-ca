import { PrismaClient } from '@generated/prisma/client';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvConfigService } from '../../env-config/env-config.service';
import { LoggerUtils } from '../../utils/logger.utils';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  readonly #logger = new Logger(PrismaService.name);

  constructor(private readonly _configService: EnvConfigService) {
    const environment = _configService.getNodeEnv();
    const logQueries = _configService.getLogPrismaQueries();

    const adapter = new PrismaPg({});

    super({
      adapter,
      log: logQueries ? LoggerUtils.getPrismaLogger(environment) : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    this.#logger.log('Connecting to the database...');

    try {
      await this.$connect();
      this.#logger.log('Connected to the database');
    } catch (error) {
      this.#logger.error('Error connecting to the database', error as string);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.#logger.log('Disconnected from the database');
  }
}
