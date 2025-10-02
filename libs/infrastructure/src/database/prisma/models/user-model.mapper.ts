import { User } from '@generated/prisma';
import { UserEntity, UserProps } from '@lib/core/entities/user.entity';
import { ValidationError } from '@lib/shared/core/errors/validation-error';

export class UserModelMapper {
  static toEntity(model: User): UserEntity {
    const data: UserProps = {
      email: model.email,
      password: model.password,
      isActive: model.isActive,
      activationToken: model.activationToken,
      activationTokenExpiresAt: model.activationTokenExpiresAt,
      passwordResetToken: model.passwordResetToken,
      passwordResetTokenExpiresAt: model.passwordResetTokenExpiresAt,
      lastLoginAt: model.lastLoginAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      activatedAt: model.activatedAt,
      deactivatedAt: model.deactivatedAt,
      createdBy: model.createdBy,
      updatedBy: model.updatedBy,
      activatedBy: model.activatedBy,
      deactivatedBy: model.deactivatedBy,
      roleId: model.roleId,
    };

    try {
      return new UserEntity(data);
    } catch {
      throw new ValidationError(`Invalid user data`);
    }
  }
}
