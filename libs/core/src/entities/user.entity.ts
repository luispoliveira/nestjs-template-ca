import { Entity } from '@lib/shared/core/entities/entity';
import { EntityValidationError } from '@lib/shared/core/errors/validation-error';
import { UserValidatorFactory } from '../validators/user.validator';

export interface UserProps {
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
  roleId?: string | null;
}

export class UserEntity extends Entity<UserProps> {
  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    UserEntity.validate(props);
    super(props, id);
    this.props.createdAt = props.createdAt ?? new Date();
  }

  static validate(props: UserProps) {
    const validator = UserValidatorFactory.create();
    const isValid = validator.validate(props);

    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  updatePassword(newPassword: string, updatedBy: string) {
    UserEntity.validate({ ...this.props, password: newPassword, updatedBy });
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  activate(activatedBy: string) {
    if (this.props.isActive) {
      return;
    }
    UserEntity.validate({
      ...this.props,
      isActive: true,
      activatedAt: new Date(),
      activatedBy,
      updatedBy: activatedBy,
    });
    this.props.isActive = true;
    this.props.activatedAt = new Date();
    this.props.activatedBy = activatedBy;
    this.props.updatedAt = new Date();
    this.props.updatedBy = activatedBy;
  }

  deactivate(deactivatedBy: string) {
    if (!this.props.isActive) {
      return;
    }
    UserEntity.validate({
      ...this.props,
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy,
      updatedBy: deactivatedBy,
    });
    this.props.isActive = false;
    this.props.deactivatedAt = new Date();
    this.props.deactivatedBy = deactivatedBy;
    this.props.updatedAt = new Date();
    this.props.updatedBy = deactivatedBy;
  }

  setActivationToken(token: string, expiresAt: Date, updatedBy: string) {
    UserEntity.validate({
      ...this.props,
      activationToken: token,
      activationTokenExpiresAt: expiresAt,
      updatedBy,
    });
    this.props.activationToken = token;
    this.props.activationTokenExpiresAt = expiresAt;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  clearActivationToken(updatedBy: string) {
    UserEntity.validate({
      ...this.props,
      activationToken: null,
      activationTokenExpiresAt: null,
      updatedBy,
    });
    this.props.activationToken = null;
    this.props.activationTokenExpiresAt = null;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  setPasswordResetToken(token: string, expiresAt: Date, updatedBy: string) {
    UserEntity.validate({
      ...this.props,
      passwordResetToken: token,
      passwordResetTokenExpiresAt: expiresAt,
      updatedBy,
    });
    this.props.passwordResetToken = token;
    this.props.passwordResetTokenExpiresAt = expiresAt;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  clearPasswordResetToken(updatedBy: string) {
    UserEntity.validate({
      ...this.props,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      updatedBy,
    });
    this.props.passwordResetToken = null;
    this.props.passwordResetTokenExpiresAt = null;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  updateLastLogin() {
    this.props.lastLoginAt = new Date();
  }

  assignRole(roleId: string, updatedBy: string) {
    UserEntity.validate({ ...this.props, roleId, updatedBy });
    this.props.roleId = roleId;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  removeRole(updatedBy: string) {
    UserEntity.validate({ ...this.props, roleId: null, updatedBy });
    this.props.roleId = null;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  get email(): string {
    return this.props.email;
  }

  private set email(value: string) {
    this.props.email = value;
  }

  get password(): string | null | undefined {
    return this.props.password;
  }

  private set password(value: string | null | undefined) {
    this.props.password = value;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  private set isActive(value: boolean) {
    this.props.isActive = value;
  }

  get roleId(): string | null | undefined {
    return this.props.roleId;
  }

  private set roleId(value: string | null | undefined) {
    this.props.roleId = value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get activatedAt(): Date | null {
    return this.props.activatedAt;
  }

  get deactivatedAt(): Date | null {
    return this.props.deactivatedAt;
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  get activationToken(): string | null {
    return this.props.activationToken;
  }

  get activationTokenExpiresAt(): Date | null {
    return this.props.activationTokenExpiresAt;
  }

  get passwordResetToken(): string | null {
    return this.props.passwordResetToken;
  }

  get passwordResetTokenExpiresAt(): Date | null {
    return this.props.passwordResetTokenExpiresAt;
  }

  get createdBy(): string | null {
    return this.props.createdBy;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy;
  }

  get activatedBy(): string | null {
    return this.props.activatedBy;
  }

  get deactivatedBy(): string | null {
    return this.props.deactivatedBy;
  }
}
