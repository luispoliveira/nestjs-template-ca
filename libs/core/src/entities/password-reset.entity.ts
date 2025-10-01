import { v4 as uuidv4 } from 'uuid';
import { Email } from '../value-objects/email.vo';
import { Token } from '../value-objects/token.vo';
import { UserId } from '../value-objects/user-id.vo';
export class PasswordReset {
  id: string;
  userId: UserId;
  email: Email;
  token: Token;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;

  constructor(userId: UserId, email: Email, token: Token, expirationMinutes: number, id?: string) {
    this.id = id ?? uuidv4();
    this.userId = userId;
    this.email = email;
    this.token = token;

    this.expiresAt = new Date(Date.now() + expirationMinutes * 60000);
    this.usedAt = null;
    this.createdAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  markAsUsed() {
    this.usedAt = new Date();
  }
}
