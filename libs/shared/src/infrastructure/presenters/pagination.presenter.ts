import { Transform } from 'class-transformer';

export type PaginationPresenterProps = {
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
};

export class PaginationPresenter {
  @Transform(({ value }) => Number(value))
  currentPage: number;
  @Transform(({ value }) => Number(value))
  perPage: number;
  @Transform(({ value }) => Number(value))
  lastPage: number;
  @Transform(({ value }) => Number(value))
  total: number;

  constructor(protected props: PaginationPresenterProps) {
    this.currentPage = props.currentPage;
    this.perPage = props.perPage;
    this.lastPage = props.lastPage;
    this.total = props.total;
  }
}
