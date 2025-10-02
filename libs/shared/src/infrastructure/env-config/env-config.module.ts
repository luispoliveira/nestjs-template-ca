import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { join } from 'path';
import { EnvConfigService } from './env-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
  static async forRoot(options: ConfigModuleOptions = {}) {
    return await super.forRoot({
      ...options,
      envFilePath: [join(__dirname, `../../../../../.env.${process.env.NODE_ENV}.local`)],
    });
  }
}
