import { UserRepository } from '@lib/core/repositories/user.repository';
import {
  PaginationOutputDTO,
  PaginationOutputMapper,
} from '@lib/shared/application/dtos/pagination-output.dto';
import { SearchInputDTO } from '@lib/shared/application/dtos/search-input.dto';
import { UseCase as DefaultUseCase } from '@lib/shared/application/usecases/use-case';
import { UserOutputDTO, UserOutputMapper } from '../dtos/user-output.dto';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListUsersUseCase {
  export type Input = SearchInputDTO<UserRepository.Filter>;

  export type Output = PaginationOutputDTO<UserOutputDTO>;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private readonly userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const params = new UserRepository.SearchParams(input);
      const searchResult = await this.userRepository.search(params);

      return this.toOutput(searchResult);
    }

    private toOutput(searchResult: UserRepository.SearchResult): Output {
      const items = searchResult.items.map((item) => {
        return UserOutputMapper.toOutput(item);
      });

      return PaginationOutputMapper.toOutput(items, searchResult);
    }
  }
}
