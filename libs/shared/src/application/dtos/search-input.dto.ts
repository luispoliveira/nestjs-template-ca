import { SortDirection } from '@lib/shared';

export type SearchInputDTO<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection | null;
  filter?: Filter | null;
};
