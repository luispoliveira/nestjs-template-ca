import { UserRepository } from '@lib/core';
import { UseCase as DefaultUseCase } from '@lib/shared';
import { UserOutputDTO, UserOutputMapper } from '../dtos/user-output.dto';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetUserUseCase {
  export type Input = {
    id: number;
  };

  export type Output = UserOutputDTO;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private readonly userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<UserOutputDTO> {
      const entity = await this.userRepository.findById(input.id);

      return UserOutputMapper.toOutput(entity);
    }
  }
}
