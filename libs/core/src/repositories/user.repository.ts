import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
} from '@lib/shared/core/repositories/searchable-repository.interface';
import { UserEntity } from '../entities/user.entity';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserRepository {
  export type Filter = {
    id?: string;
    email?: string;
    isActive?: boolean;
  };

  export class SearchParams extends DefaultSearchParams<Filter> {}

  export class SearchResult extends DefaultSearchResult<UserEntity, Filter> {}

  export interface Repository
    extends SearchableRepositoryInterface<UserEntity, Filter, SearchParams, SearchResult> {
    findByEmail(email: string): Promise<UserEntity>;
    emailExists(email: string): Promise<void>;
  }
}
