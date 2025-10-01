import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
    this.name = this.constructor.name;
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id?: string) {
    const message = id ? `${entityName} with ID ${id} not found` : `${entityName} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class EntityAlreadyExistsException extends DomainException {
  constructor(entityName: string, identifier?: string) {
    const message = identifier
      ? `${entityName} with identifier ${identifier} already exists`
      : `${entityName} already exists`;
    super(message, HttpStatus.CONFLICT);
  }
}

export class InvalidInputException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class AuthenticationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class OtpExpiredException extends DomainException {
  constructor() {
    super('OTP has expired', HttpStatus.GONE);
  }
}

export class OtpInvalidException extends DomainException {
  constructor() {
    super('Invalid OTP', HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class InvalidValueObjectException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ThrottlingException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class InvalidThrottleIdentifierException extends DomainException {
  constructor() {
    super('Throttle identifier cannot be empty', HttpStatus.BAD_REQUEST);
  }
}

export abstract class UserDomainException extends DomainException {}
export abstract class RoleDomainException extends DomainException {}
export abstract class AuthenticationDomainException extends DomainException {}
export abstract class FileDomainException extends DomainException {}

export class UserNotEligibleForRoleException extends UserDomainException {
  constructor(userId: string, roleName: string) {
    super(`User with ID ${userId} is not eligible for role ${roleName}`, HttpStatus.BAD_REQUEST);
  }
}

export class InactiveUserException extends UserDomainException {
  constructor(operation: string) {
    super(`Cannot ${operation} for inactive user`, HttpStatus.BAD_REQUEST);
  }
}

export class UserCannotRemoveLastRoleException extends UserDomainException {
  constructor() {
    super('Cannot remove the last role from user', HttpStatus.BAD_REQUEST);
  }
}

export class CannotDeleteDefaultRoleException extends RoleDomainException {
  constructor() {
    super('Cannot delete the default role', HttpStatus.BAD_REQUEST);
  }
}

export class RoleHasAssignedUsersException extends RoleDomainException {
  constructor(roleName: string) {
    super(`Cannot delete role ${roleName} because it has assigned users`, HttpStatus.BAD_REQUEST);
  }
}

export class PermissionAlreadfyAssignedException extends RoleDomainException {
  constructor(permission: string, roleName: string) {
    super(`Permission ${permission} is already assigned to role ${roleName}`, HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends AuthenticationDomainException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}

export class AccountLockedException extends AuthenticationDomainException {
  constructor() {
    super('Account is locked', HttpStatus.LOCKED);
  }
}

export class TwoFactorRequiredException extends AuthenticationDomainException {
  constructor() {
    super('Two-factor authentication is required', HttpStatus.UNAUTHORIZED);
  }
}

export class FileNotOwnedByUserException extends FileDomainException {
  constructor(fileId: string, userId: string) {
    super(`File with ID ${fileId} is not owned by user with ID ${userId}`, HttpStatus.FORBIDDEN);
  }
}

export class FileAccessDeniedException extends FileDomainException {
  constructor(fileId: string) {
    super(`Access to file with ID ${fileId} is denied`, HttpStatus.FORBIDDEN);
  }
}

export class InvalidFileOperationException extends FileDomainException {
  constructor(operation: string, reason: string) {
    super(`Cannot ${operation}: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}

export class BusinessRuleValidationException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'BusinessRuleValidationException';
  }
}

export class HealthCheckException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
    this.name = 'HealthCheckException';
  }
}

export class DatabaseConnectionException extends HealthCheckException {
  constructor(message: string) {
    super(`Database connection error: ${message}`);
    this.name = 'DatabaseConnectionException';
  }
}

export class ConfigurationException extends HealthCheckException {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'ConfigurationException';
  }
}
