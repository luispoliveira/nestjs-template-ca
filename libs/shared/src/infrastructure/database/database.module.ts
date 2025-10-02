import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfigModule } from '../env-config/env-config.module';
import { validationSchema } from './config/validation';

@Global()
@Module({
  imports: [
    EnvConfigModule.forRoot({
      validationSchema,
    }),
  ],
  providers: [ConfigService],
})
export class DatabaseModule {}
