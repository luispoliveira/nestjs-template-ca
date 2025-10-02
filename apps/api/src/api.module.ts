import { DatabaseModule, EnvConfigModule } from '@lib/shared';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [EnvConfigModule, UsersModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
