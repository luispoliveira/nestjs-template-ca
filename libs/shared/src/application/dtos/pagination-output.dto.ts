/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, SearchResult } from '@lib/shared';

export type PaginationOutputDTO<Item = any> = {
  items: Item[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
};

export class PaginationOutputMapper {
  static toOutput<Item = any, Filter = any>(
    items: Item[],
    result: SearchResult<Entity, Filter>,
  ): PaginationOutputDTO<Item> {
    return {
      items,
      total: result.total,
      currentPage: result.currentPage,
      lastPage: result.lastPage,
      perPage: result.perPage,
    };
  }
}
