import { v4 as uuid } from 'uuid';
import { Email } from '../value-objects/email.vo';
import { VerificationCode } from '../value-objects/verification-code.vo';
export class EmailVerification {
  id: string;
  email: Email;
  code: VerificationCode;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;

  constructor(email: Email, code: VerificationCode, expirationMinutes: number = 5, id?: string) {
    this.id = id ?? uuid();
    this.email = email;
    this.code = code;

    const now = new Date();
    this.expiresAt = new Date(now.getTime() + expirationMinutes * 60000);
    this.verifiedAt = null;
    this.createdAt = now;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isVerified(): boolean {
    return this.verifiedAt !== null;
  }

  markAsVerified(): void {
    this.verifiedAt = new Date();
  }
}
