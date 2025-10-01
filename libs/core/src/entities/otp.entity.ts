import { UserId } from '@lib/core/value-objects/user-id.vo';
import { v4 as uuidv4 } from 'uuid';
export class Otp {
  id: string;
  userId: UserId;
  secret: string;
  expiresAt: Date;
  verifiedAt?: Date;
  createdAt: Date;

  constructor(userId: UserId, secret: string, expirationMinutes: number, id?: string) {
    this.id = id ?? uuidv4();
    this.userId = userId;
    this.secret = secret;
    this.expiresAt = new Date(Date.now() + expirationMinutes * 60000);
    this.createdAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  markAsVerified() {
    this.verifiedAt = new Date();
  }
}
