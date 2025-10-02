import { ListUsersUseCase } from '@lib/application';
import { UserRepository } from '@lib/core';
import * as shared from '@lib/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class ListUsersDto implements ListUsersUseCase.Input {
  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    default: shared.DEFAULT_PER_PAGE,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  perPage?: number;

  @ApiPropertyOptional({
    example: 'id',
    description: 'Sort by field',
    default: shared.DEFAULT_SORT_FIELD,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sort?: string;

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort direction',
    default: shared.DEFAULT_SORT_DIRECTION,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortDirection?: shared.SortDirection;

  @ApiPropertyOptional({
    description: 'Search filter as JSON string',
    type: String,
    example: '{"filter":{"email":"test@example.com","isActive":true}}',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as UserRepository.Filter;
      } catch {
        return {} as UserRepository.Filter;
      }
    }
    return value as UserRepository.Filter;
  })
  filter?: UserRepository.Filter;
}
