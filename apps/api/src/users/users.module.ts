import { GetUserUseCase, ListUsersUseCase } from '@lib/application';
import { UserRepository } from '@lib/core';
import { BcryptjsHashProvider, UserPrismaRepository } from '@lib/infrastructure';
import { PrismaService } from '@lib/shared';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: PrismaService,
      useClass: PrismaService,
    },
    {
      provide: 'UserRepository',
      useFactory: (prismaService: PrismaService) => {
        return new UserPrismaRepository(prismaService);
      },
      inject: [PrismaService],
    },
    {
      provide: 'HashProvider',
      useClass: BcryptjsHashProvider,
    },
    {
      provide: ListUsersUseCase.UseCase,
      useFactory: (UserRepository: UserRepository.Repository) => {
        return new ListUsersUseCase.UseCase(UserRepository);
      },
      inject: ['UserRepository'],
    },
    {
      provide: GetUserUseCase.UseCase,
      useFactory: (UserRepository: UserRepository.Repository) => {
        return new GetUserUseCase.UseCase(UserRepository);
      },
      inject: ['UserRepository'],
    },
  ],
})
export class UsersModule {}
