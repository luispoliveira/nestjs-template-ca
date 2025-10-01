import { v4 as uuidv4 } from 'uuid';
import { InvalidValueObjectException } from '../exceptions/domain-exceptions';
export abstract class EntityId {
  protected readonly _value: string;

  protected constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new InvalidValueObjectException(`${this.constructor.name} cannot be empty`);
    }
    this._value = value;
  }

  protected static generateId(): string {
    return uuidv4();
  }

  getValue(): string {
    return this._value;
  }

  equals(other: EntityId): boolean {
    return this._value === other._value && this.constructor === other.constructor;
  }

  toString(): string {
    return this._value;
  }
}
