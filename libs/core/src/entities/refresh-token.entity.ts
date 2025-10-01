import { v4 as uuidv4 } from 'uuid';
import { Token } from '../value-objects/token.vo';
import { UserId } from '../value-objects/user-id.vo';
export class RefreshToken {
  id: string;
  userId: UserId;
  token: Token;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;

  constructor(userId: UserId, token: Token, expirationDays: number, id?: string) {
    this.id = id ?? uuidv4();
    this.userId = userId;
    this.token = token;
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + expirationDays);
    this.createdAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  revoke() {
    this.revokedAt = new Date();
  }
}
