import { UserEntity } from '@lib/core/entities/user.entity';

export type UserOutputDTO = {
  id: number;
  email: string;
  password?: string | null;
  isActive: boolean;
  activationToken: string | null;
  activationTokenExpiresAt: Date | null;
  passwordResetToken: string | null;
  passwordResetTokenExpiresAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  activatedBy: string | null;
  deactivatedBy: string | null;
  roleId?: number | null;
};

export class UserOutputMapper {
  static toOutput(entity: UserEntity): UserOutputDTO {
    return entity.toJSON();
  }
}
