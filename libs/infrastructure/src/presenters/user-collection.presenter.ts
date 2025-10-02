import { ListUsersUseCase } from '@lib/application';
import { CollectionPresenter } from '@lib/shared';
import { UserPresenter } from './user.presenter';

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[];

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new UserPresenter(item));
  }
}
