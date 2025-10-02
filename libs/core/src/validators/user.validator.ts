import { ClassValidatorFields } from '@lib/shared/core/validators/class-validator-fields';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { UserProps } from '../entities/user.entity';

export class UserRules {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password?: string | null;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsUUID()
  activationToken: string | null;

  @IsOptional()
  @IsDate()
  activationTokenExpiresAt: Date | null;

  @IsOptional()
  @IsUUID()
  passwordResetToken: string | null;

  @IsOptional()
  @IsDate()
  passwordResetTokenExpiresAt: Date | null;

  @IsOptional()
  @IsDate()
  lastLoginAt: Date | null;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  activatedAt: Date | null;

  @IsOptional()
  @IsDate()
  deactivatedAt: Date | null;

  @IsOptional()
  @IsNotEmpty()
  createdBy: string | null;

  @IsOptional()
  @IsNotEmpty()
  updatedBy: string | null;

  @IsOptional()
  @IsNotEmpty()
  activatedBy: string | null;

  @IsOptional()
  @IsNotEmpty()
  deactivatedBy: string | null;

  @IsOptional()
  @IsUUID()
  roleId?: string | null;

  constructor({
    email,
    password,
    isActive,
    activationToken,
    activationTokenExpiresAt,
    passwordResetToken,
    passwordResetTokenExpiresAt,
    lastLoginAt,
    createdAt,
    updatedAt,
    activatedAt,
    deactivatedAt,
    createdBy,
    updatedBy,
    activatedBy,
    deactivatedBy,
    roleId,
  }: UserProps) {
    Object.assign(this, {
      email,
      password,
      isActive,
      activationToken,
      activationTokenExpiresAt,
      passwordResetToken,
      passwordResetTokenExpiresAt,
      lastLoginAt,
      createdAt,
      updatedAt,
      activatedAt,
      deactivatedAt,
      createdBy,
      updatedBy,
      activatedBy,
      deactivatedBy,
      roleId,
    });
  }
}

export class UserValidator extends ClassValidatorFields<UserRules> {
  validate(props: UserRules): boolean {
    return super.validate(new UserRules(props ?? {}));
  }
}

export class UserValidatorFactory {
  static create(): UserValidator {
    return new UserValidator();
  }
}
