import { Entity } from '../entities/entity';
import { NotFoundError } from '../errors/not-found-error';
import { RepositoryInterface } from './repository.interface';

export abstract class InMemoryRepository<E extends Entity> implements RepositoryInterface<E> {
  items: E[] = [];
  async insert(entity: E): Promise<void> {
    this.items.push(entity);
    return Promise.resolve();
  }
  async findById(id: string): Promise<E> {
    return await this._get(id);
  }
  async findAll(): Promise<E[]> {
    return Promise.resolve(this.items);
  }
  async update(entity: E): Promise<void> {
    const index = await this._getIndex(entity.id);
    this.items[index] = entity;
    return Promise.resolve();
  }
  async delete(id: string): Promise<void> {
    const index = await this._getIndex(id);
    this.items.splice(index, 1);
    return Promise.resolve();
  }

  private async _getIndex(id: string): Promise<number> {
    const _id = `${id}`;
    const index = this.items.findIndex((item) => item.id === _id);
    if (index === -1) {
      return Promise.reject(new NotFoundError(`Entity with id ${id} not found`));
    }
    return Promise.resolve(index);
  }

  private async _get(id: string) {
    const item = await this._getIndex(id);
    return Promise.resolve(this.items[item]);
  }
}
