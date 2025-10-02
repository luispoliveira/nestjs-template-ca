import { ListUsersUseCase, UserOutputDTO } from '@lib/application';
import { UserCollectionPresenter, UserPresenter } from '@lib/infrastructure';
import { ListUsersDto } from '@lib/infrastructure/dtos/user/list-users.dto';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Inject(ListUsersUseCase.UseCase)
  private readonly listUsersUseCase: ListUsersUseCase.UseCase;

  static userToResponse(output: UserOutputDTO) {
    return new UserPresenter(output);
  }

  static listUsersToResponse(output: ListUsersUseCase.Output) {
    return new UserCollectionPresenter(output);
  }

  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            currentPage: { type: 'number', example: 1 },
            perPage: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserPresenter) },
        },
      },
    },
  })
  @Get()
  async search(@Query() query: ListUsersDto) {
    const output = await this.listUsersUseCase.execute(query);
    return UsersController.listUsersToResponse(output);
  }
}
