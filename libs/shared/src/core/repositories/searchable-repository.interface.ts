import { Entity } from '../entities/entity';
import { RepositoryInterface } from './repository.interface';

export type SortDirection = 'asc' | 'desc';

export interface SearchProps<Filter = string> {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDirection?: SortDirection | null;
  filter?: Filter | null;
}

export interface SearchResultProps<E extends Entity, Filter> {
  items: E[];
  total: number;
  currentPage: number;
  perPage: number;
  sort: string | null;
  sortDirection: SortDirection | null;
  filter: Filter | null;
}

export class SearchParams<Filter = string> {
  protected _page: number;
  protected _perPage: number;
  protected _sort: string | null;
  protected _sortDirection: SortDirection | null;
  protected _filter: Filter | null;

  constructor(props: SearchProps<Filter> = {}) {
    this._page = props.page ?? 1;
    this._perPage = props.perPage ?? 20;
    this._sort = props.sort ?? null;
    this._sortDirection = props.sortDirection ?? null;
    this._filter = props.filter ?? null;
  }

  get page(): number {
    return this._page;
  }

  private set page(value: number) {
    let _page = value === (true as unknown) ? 1 : +value;

    if (isNaN(_page) || _page <= 0 || parseInt(_page.toString(), 10) !== _page) {
      _page = 1;
    }

    this._page = _page;
  }

  get perPage(): number {
    return this._perPage;
  }

  private set perPage(value: number) {
    let _perPage = value === (true as unknown) ? 20 : +value;

    if (isNaN(_perPage) || _perPage <= 0 || parseInt(_perPage.toString(), 10) !== _perPage) {
      _perPage = 20;
    }

    this._perPage = _perPage;
  }

  get sort(): string | null {
    return this._sort;
  }

  private set sort(value: string | null) {
    this._sort =
      value === null || value === undefined || value === (true as unknown) || value === ''
        ? null
        : `${value}`;
  }

  get sortDirection(): SortDirection | null {
    return this._sortDirection;
  }

  private set sortDirection(value: SortDirection | null) {
    if (!this.sort) {
      this._sortDirection = null;
      return;
    }
    const dir = `${value}`.toLowerCase();
    this._sortDirection = dir !== 'asc' && dir !== 'desc' ? 'asc' : (dir as SortDirection);
  }

  get filter(): Filter | null {
    return this._filter;
  }

  private set filter(value: Filter | null) {
    this._filter =
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      value === null || value === undefined || value === '' ? null : (`${value}` as Filter);
  }
}

export class SearchResult<E extends Entity, Filter = string> {
  readonly items: E[];
  readonly total: number;
  readonly currentPage: number;
  readonly perPage: number;
  readonly lastPage: number;
  readonly sort: string | null;
  readonly sortDirection: SortDirection | null;
  readonly filter: Filter | null;

  constructor(props: SearchResultProps<E, Filter>) {
    this.items = props.items;
    this.total = props.total;
    this.currentPage = props.currentPage;
    this.perPage = props.perPage;
    this.lastPage = Math.ceil(props.total / props.perPage);
    this.sort = props.sort ?? null;
    this.sortDirection = props.sortDirection ?? null;
    this.filter = props.filter ?? null;
  }

  toJSON(forceEntity = false) {
    return {
      items: forceEntity ? this.items.map((item) => item.toJSON()) : this.items,
      total: this.total,
      currentPage: this.currentPage,
      perPage: this.perPage,
      lastPage: this.lastPage,
      sort: this.sort,
      sortDirection: this.sortDirection,
      filter: this.filter,
    };
  }
}

export interface SearchableRepositoryInterface<
  E extends Entity,
  Filter = string,
  SearchInput = SearchParams<Filter>,
  SearchOutput = SearchResult<E, Filter>,
> extends RepositoryInterface<E> {
  sortableFields: string[];
  search(props: SearchInput): Promise<SearchOutput>;
}
