import {
  InactiveUserException,
  InvalidValueObjectException,
  UserAlreadyHasRoleException,
  UserCannotRemoveLastRoleException,
  UserNotEligibleForRoleException,
} from '../exceptions/domain-exceptions';
import { RolesCollection } from '../value-objects/collections/roles.collection';
import { Email } from '../value-objects/email.vo';
import { FirstName, LastName } from '../value-objects/name.vo';
import { RoleId } from '../value-objects/role-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { CanAssignRoleSpecification } from './../specifications/user.specification';
import { Role } from './role.entity';

export class User {
  private readonly _id: UserId;
  private _email: Email;
  private _passwordHash: string;
  private _firstName: FirstName;
  private _lastName: LastName;
  private _isActive: boolean;
  private _otpEnabled: boolean;
  private _otpSecret?: string;
  private _roles: Role[];
  private _lastLoginAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: UserId,
    email: Email,
    passwordHash: string,
    firstName: FirstName,
    lastName: LastName,
    isActive: boolean = true,
    createdAt?: Date,
  ) {
    this._id = id;
    this._email = email;
    this._passwordHash = passwordHash;
    this._firstName = firstName;
    this._lastName = lastName;
    this._isActive = isActive;
    this._otpEnabled = false;
    this._roles = [];
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = new Date();
  }

  static create(email: Email, passwordHash: string, firstName: FirstName, lastName: LastName) {
    const userId = UserId.create();
    const user = new User(userId, email, passwordHash, firstName, lastName);
    return user;
  }

  static fromData(data: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    otpEnabled: boolean;
    otpSecret?: string;
    roles: Role[];
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const user = new User(
      UserId.fromString(data.id),
      new Email(data.email),
      data.passwordHash,
      new FirstName(data.firstName),
      new LastName(data.lastName),
      data.isActive,
      data.createdAt,
    );

    user._otpEnabled = data.otpEnabled;
    user._otpSecret = data.otpSecret;
    user._roles = data.roles;
    user._lastLoginAt = data.lastLoginAt;
    user._updatedAt = data.updatedAt;

    return user;
  }

  get id() {
    return this._id;
  }

  get email() {
    return this._email;
  }

  get passwordHash() {
    return this._passwordHash;
  }

  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
  }

  get isActive() {
    return this._isActive;
  }

  get otpEnabled() {
    return this._otpEnabled;
  }

  get otpSecret() {
    return this._otpSecret;
  }

  get roles() {
    return [...this._roles];
  }

  get rolesCollection() {
    return RolesCollection.create(this._roles);
  }

  get lastLoginAt() {
    return this._lastLoginAt;
  }

  get createdAt() {
    return this._createdAt;
  }

  activate() {
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate() {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  enableTwoFactor(otpSecret: string) {
    if (!otpSecret || otpSecret.trim().length === 0) {
      throw new InvalidValueObjectException('Two-factor secret cannot be empty');
    }

    if (!this._isActive) {
      throw new InactiveUserException('enable two-factor authentication');
    }

    this._otpEnabled = true;
    this._otpSecret = otpSecret;
    this._updatedAt = new Date();
  }

  disableTwoFactor() {
    if (!this._otpEnabled) {
      return;
    }

    this._otpEnabled = false;
    this._otpSecret = undefined;
    this._updatedAt = new Date();
  }

  enableOtp(secret: string) {
    this.enableTwoFactor(secret);
  }

  disableOtp() {
    this.disableTwoFactor();
  }

  addRole(role: Role) {
    const canAssignRoleSpec = new CanAssignRoleSpecification(role);

    if (!canAssignRoleSpec.isSatisfiedBy(this)) {
      if (!this.isActive) {
        throw new InactiveUserException('assign role to inactive user');
      }

      if (this.hasRole(role.id)) {
        throw new UserAlreadyHasRoleException(this._id.getValue(), role.name);
      }

      throw new UserNotEligibleForRoleException(this._id.getValue(), role.name);
    }
    this._roles.push(role);
    this._updatedAt = new Date();
  }

  removeRole(roleId: RoleId) {
    if (!this.isActive) {
      throw new InactiveUserException('remove role from inactive user');
    }

    if (this._roles.length <= 1) {
      throw new UserCannotRemoveLastRoleException();
    }

    const roleToRemove = this._roles.find((r) => r.id.equals(roleId));
    if (!roleToRemove) {
      return; // role not assigned, nothing to do
    }

    this._roles = this._roles.filter((r) => !r.id.equals(roleId));
    this._updatedAt = new Date();
  }

  changeEmail(newEmail: Email) {
    if (!this.isActive) {
      throw new InactiveUserException('change email of inactive user');
    }

    if (this._email.equals(newEmail)) {
      return; // no change
    }

    this._email = newEmail;
    this._updatedAt = new Date();
  }

  changePassword(newPasswordHash: string) {
    if (!this.isActive) {
      throw new InactiveUserException('change password of inactive user');
    }

    if (!newPasswordHash || newPasswordHash.trim().length === 0) {
      throw new InvalidValueObjectException('Password hash cannot be empty');
    }

    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  updateLastLogin() {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  updateProfile(firstName?: FirstName, lastName?: LastName) {
    if (!this.isActive) {
      throw new InactiveUserException('update profile of inactive user');
    }

    let hasChanges = false;

    if (firstName && !this._firstName.equals(firstName)) {
      this._firstName = firstName;
      hasChanges = true;
    }

    if (lastName && !this._lastName.equals(lastName)) {
      this._lastName = lastName;
      hasChanges = true;
    }

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  hasRole(roleId: RoleId) {
    return this._roles.some((r) => r.id.equals(roleId));
  }

  hasPermission(permissionName: string) {
    return this.rolesCollection.hasPermission(permissionName);
  }

  getFullName() {
    return `${this._firstName.getValue()} ${this._lastName.getValue()}`;
  }

  isEligibleForAdminRole() {
    return this._isActive && this.rolesCollection.hasAdminPrivileges();
  }

  private isEligibleForRole(role: Role) {
    if (!this.isActive) {
      return false;
    }

    if (role.isAdminRole() && !this.isEligibleForAdminRole()) {
      return false;
    }

    return true;
  }
}
