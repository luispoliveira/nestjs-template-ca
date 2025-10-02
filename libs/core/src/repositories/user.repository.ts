import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
} from '@lib/shared/core/repositories/searchable-repository.interface';
import { UserEntity } from '../entities/user.entity';
export interface UserRepositoryFilter {
  id?: string;
  email?: string;
  isActive?: boolean;
}

export class UserRepositorySearchParams extends DefaultSearchParams<UserRepositoryFilter> {}

export class UserRepositorySearchResult extends DefaultSearchResult<
  UserEntity,
  UserRepositoryFilter
> {}

export interface UserRepositoryInterface
  extends SearchableRepositoryInterface<
    UserEntity,
    UserRepositoryFilter,
    UserRepositorySearchParams,
    UserRepositorySearchResult
  > {
  findByEmail(email: string): Promise<UserEntity>;
  emailExists(email: string): Promise<void>;
}
