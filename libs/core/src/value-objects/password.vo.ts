import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!this.isValid(password)) {
      throw new InvalidValueObjectException(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
    this.value = password;
  }

  getValue(): string {
    return this.value;
  }

  private isValid(password: string): boolean {
    // The Password must be at least 8 characters long and include at least one uppercase letter,
    // one lowercase letter, one number, and one special character
    const passwordRegex =
      // eslint-disable-next-line max-len
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{8,}$/;

    return passwordRegex.test(password);
  }
}
