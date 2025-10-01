import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export class Name {
  private readonly value: string;

  constructor(name: string) {
    if (!this.isValid(name)) {
      throw new InvalidValueObjectException('Invalid name format');
    }
    this.value = this.formatName(name);
  }

  getValue(): string {
    return this.value;
  }

  equals(name: Name): boolean {
    return this.value === name.getValue();
  }

  private isValid(name: string): boolean {
    return name.trim().length > 0 && name.length <= 100;
  }

  private formatName(name: string): string {
    return name.trim();
  }
}

export class FirstName extends Name {
  constructor(firstName: string) {
    super(firstName);
  }
}

export class LastName extends Name {
  constructor(lastName: string) {
    super(lastName);
  }
}

export class FullName {
  private readonly firstName: FirstName;
  private readonly lastName: LastName;

  constructor(firstName: FirstName, lastName: LastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  getFirstName(): FirstName {
    return this.firstName;
  }

  getLastName(): LastName {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName.getValue()} ${this.lastName.getValue()}`;
  }
}
