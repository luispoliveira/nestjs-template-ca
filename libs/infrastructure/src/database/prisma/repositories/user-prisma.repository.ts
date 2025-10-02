import { Prisma } from '@generated/prisma';
import { UserEntity, UserRepository } from '@lib/core';
import {
  ConflicError,
  DEFAULT_PER_PAGE,
  DEFAULT_SKIP,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_SORT_FIELD,
  NotFoundError,
  PrismaService,
} from '@lib/shared';
import { UserModelMapper } from '../models/user-model.mapper';

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['email', 'createdAt', 'updatedAt'];

  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const model = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!model) {
      throw new NotFoundError(`User with email ${email} not found`);
    }

    return UserModelMapper.toEntity(model);
  }
  async emailExists(email: string): Promise<void> {
    const model = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (model) {
      throw new ConflicError(`User with email ${email} already exists`);
    }
  }

  async search(props: UserRepository.SearchParams): Promise<UserRepository.SearchResult> {
    const sortable = props.sort ? this.sortableFields.includes(props.sort) : false;

    const orderByField = sortable && props.sort ? props.sort : DEFAULT_SORT_FIELD;
    const orderByDirection = props.sort && sortable ? props.sortDirection : DEFAULT_SORT_DIRECTION;
    const skip = props.page && props.perPage ? (props.page - 1) * props.perPage : DEFAULT_SKIP;
    const take = props.perPage && props.perPage > 0 ? props.perPage : DEFAULT_PER_PAGE;

    const where: Prisma.UserWhereInput = {
      ...(props.filter && {
        email: { contains: props.filter.email ?? undefined, mode: 'insensitive' },
        isActive: props.filter.isActive ?? undefined,
      }),
    };

    const [models, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        orderBy: { [orderByField]: orderByDirection },
        skip,
        take,
      }),
      this.prismaService.user.count({
        where,
      }),
    ]);

    return new UserRepository.SearchResult({
      items: models.map((model) => UserModelMapper.toEntity(model)),
      total,
      perPage: take,
      currentPage: props.page ?? 1,
      sort: orderByField,
      sortDirection: orderByDirection,
      filter: props.filter,
    });
  }

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: {
        ...entity.toJSON(),
      },
    });
  }

  async findById(id: number): Promise<UserEntity> {
    return await this._get(id);
  }
  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany();

    return users.map((user) => UserModelMapper.toEntity(user));
  }
  async update(entity: UserEntity): Promise<void> {
    await this._get(entity.id);
    await this.prismaService.user.update({
      where: { id: entity.id },
      data: {
        ...entity.toJSON(),
      },
    });
  }
  async delete(id: number): Promise<void> {
    await this._get(id);
    await this.prismaService.user.delete({
      where: { id: Number(id) },
    });
  }

  protected async _get(id: number): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { id: Number(id) },
    });
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return UserModelMapper.toEntity(user);
  }
}
