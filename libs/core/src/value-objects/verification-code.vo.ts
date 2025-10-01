import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export class VerificationCode {
  private readonly value: string;

  constructor(code: string) {
    if (!this.isValid(code)) {
      throw new InvalidValueObjectException('Invalid verification code format');
    }
    this.value = code;
  }

  static generate(): VerificationCode {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return new VerificationCode(code);
  }

  getValue(): string {
    return this.value;
  }

  equals(code: VerificationCode): boolean {
    return this.value === code.getValue();
  }

  private isValid(code: string): boolean {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  }
}
