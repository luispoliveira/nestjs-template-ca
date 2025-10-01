import { v4 as uuidv4, validate } from 'uuid';
import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export class Token {
  private readonly value: string;

  constructor(token: string) {
    if (!this.isValid(token)) {
      throw new InvalidValueObjectException('Invalid token format');
    }
    this.value = token;
  }

  static generate(): Token {
    return new Token(uuidv4());
  }
  getValue(): string {
    return this.value;
  }

  equals(other: Token): boolean {
    return this.value === other.value;
  }

  private isValid(token: string): boolean {
    // Basic validation for UUID format
    return validate(token);
  }
}
