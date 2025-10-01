import {
  CannotDeleteDefaultRoleException,
  InvalidValueObjectException,
  PermissionAlreadyAssignedException,
} from '../exceptions/domain-exceptions';
import { CanAssignPermissionToRoleSpecification } from '../specifications/role.specifications';
import { PermissionsCollection } from '../value-objects/collections/permissions.collection';
import { PermissionId } from '../value-objects/permission-id.vo';
import { RoleId } from '../value-objects/role-id.vo';
import { Permission } from './permission.entity';

export class Role {
  private readonly _id: RoleId;
  private _name: string;
  private _description: string;
  private _permissions: Permission[];
  private _isDefault: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: RoleId,
    name: string,
    description: string,
    isDefault: boolean = false,
    createdAt?: Date,
  ) {
    this.validateName(name);
    this.validateDescription(description);

    this._id = id;
    this._name = name;
    this._description = description;
    this._permissions = [];
    this._isDefault = isDefault;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = new Date();
  }

  static create(name: string, description: string, isDefault = false) {
    return new Role(RoleId.create(), name, description, isDefault);
  }

  static fromData(data: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const role = new Role(
      RoleId.fromString(data.id),
      data.name,
      data.description,
      data.isDefault,
      data.createdAt,
    );
    role._permissions = data.permissions;
    role._updatedAt = data.updatedAt;
    return role;
  }

  get id(): RoleId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }

  get permissionsCollection(): PermissionsCollection {
    return PermissionsCollection.create(this._permissions);
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  addPermission(permission: Permission) {
    const canAssignPermissionSpec = new CanAssignPermissionToRoleSpecification(permission);

    if (!canAssignPermissionSpec.isSatisfiedBy(this)) {
      throw new PermissionAlreadyAssignedException(permission.getPermissionName(), this._name);
    }

    this._permissions.push(permission);
    this._updatedAt = new Date();
  }

  addPermissionsOnCreation(permissions: Permission[]) {
    this._permissions.push(...permissions);
    this._updatedAt = new Date();
  }

  removePermission(permissionId: PermissionId) {
    const permissionExists = this._permissions.some((p) => p.id.equals(permissionId));
    if (!permissionExists) {
      return;
    }

    this._permissions = this._permissions.filter((p) => !p.id.equals(permissionId));
    this._updatedAt = new Date();
  }

  updateDetails(name?: string, description?: string) {
    let hasChanges = false;
    if (name && name !== this._name) {
      this.validateName(name);
      this._name = name;
      hasChanges = true;
    }

    if (description && description !== this._description) {
      this.validateDescription(description);
      this._description = description;
      hasChanges = true;
    }

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  setAsDefault() {
    if (this._isDefault) {
      return;
    }

    this._isDefault = true;
    this._updatedAt = new Date();
  }

  removeAsDefault() {
    if (!this._isDefault) {
      return;
    }

    this._isDefault = false;
    this._updatedAt = new Date();
  }

  hasPermission(permissionId: PermissionId) {
    return this._permissions.some((p) => p.id.equals(permissionId));
  }

  hasPermissionByName(permissionName: string) {
    return this.permissionsCollection.containsByName(permissionName);
  }

  isAdminRole() {
    return (
      this.permissionsCollection.hasAdminPermissions() ||
      this._name.toLowerCase().includes('admin') ||
      this._name.toLowerCase().includes('administrator')
    );
  }

  canBeDeleted() {
    return !this._isDefault;
  }

  validateForDeletion() {
    if (!this.canBeDeleted()) {
      throw new CannotDeleteDefaultRoleException();
    }
  }

  getPermissionNames() {
    return this._permissions.map((p) => p.getPermissionName());
  }

  private validateName(name: string) {
    if (!name || name.trim().length === 0) {
      throw new InvalidValueObjectException('Role name cannot be empty');
    }

    if (name.length > 100) {
      throw new InvalidValueObjectException('Role name cannot exceed 100 characters');
    }
  }

  private validateDescription(description: string) {
    if (!description || description.trim().length === 0) {
      throw new InvalidValueObjectException('Description cannot be empty');
    }

    if (description.length > 255) {
      throw new InvalidValueObjectException('Description cannot exceed 255 characters');
    }
  }
}
