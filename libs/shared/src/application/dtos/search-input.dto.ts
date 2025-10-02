import { SortDirection } from '@lib/shared/core/repositories/searchable-repository.interface';

export interface SearchInputDTO<Filter = string> {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection | null;
  filter?: Filter | null;
}
