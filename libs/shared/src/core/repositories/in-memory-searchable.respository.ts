/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Entity } from '../entities/entity';
import { InMemoryRepository } from './in-memory.repository';
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from './searchable-repository.interface';

export abstract class InMemorySearchableRepository<E extends Entity>
  extends InMemoryRepository<E>
  implements SearchableRepositoryInterface<E>
{
  sortableFields: string[];

  async search(props: SearchParams<string>): Promise<SearchResult<E>> {
    const items = await this.findAll();
    const filteredItems = await this.applyFilter(items, props.filter);
    const sortedItems = await this.applySort(filteredItems, props.sort, props.sortDirection);
    const paginatedItems = await this.applyPaginate(sortedItems, props.page, props.perPage);
    return new SearchResult<E>({
      items: paginatedItems,
      total: filteredItems.length,
      currentPage: props.page,
      perPage: props.perPage,
      sort: props.sort,
      sortDirection: props.sortDirection,
      filter: props.filter,
    });
  }

  protected async applySort(
    items: E[],
    sort: string | null,
    sortDirection: string | null,
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return Promise.resolve(items);
    }

    return Promise.resolve(
      [...items].sort((a, b) => {
        const aValue = (a as any).props[sort];
        const bValue = (b as any).props[sort];

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }

        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }

        return 0;
      }),
    );
  }

  protected async applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ): Promise<E[]> {
    const stater = (page - 1) * perPage;
    const limit = stater + perPage;
    return Promise.resolve(items.slice(stater, limit));
  }

  protected abstract applyFilter(items: E[], filter: string | null): Promise<E[]>;
}
