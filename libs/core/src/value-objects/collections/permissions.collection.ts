import { Permission } from '@lib/core/entities/permission.entity';
import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { PermissionId } from '../permission-id.vo';

export class PermissionsCollection {
  private readonly _permissions: readonly Permission[];

  private constructor(permissions: Permission[]) {
    this.validatePermissions(permissions);
    this._permissions = permissions;
  }

  static create(permissions: Permission[] = []) {
    return new PermissionsCollection(permissions);
  }

  add(permission: Permission) {
    if (this.contains(permission.id)) {
      throw new InvalidValueObjectException(
        `Permission with ID ${permission.getPermissionName()} already exists in the collection`,
      );
    }

    return new PermissionsCollection([...this._permissions, permission]);
  }

  remove(permissionId: PermissionId) {
    const filterdPermissions = this._permissions.filter((p) => !p.id.equals(permissionId));

    if (filterdPermissions.length === this._permissions.length) {
      return this;
    }
    return new PermissionsCollection(filterdPermissions);
  }

  contains(permissionId: PermissionId) {
    return this._permissions.some((p) => p.id.equals(permissionId));
  }

  containsByName(permissionName: string) {
    return this._permissions.some((p) => p.getPermissionName() === permissionName);
  }

  getById(permissionId: PermissionId): Permission | undefined {
    return this._permissions.find((p) => p.id.equals(permissionId));
  }

  getByName(permissionName: string): Permission | undefined {
    return this._permissions.find((p) => p.getPermissionName() === permissionName);
  }

  filterByResource(resource: string): PermissionsCollection {
    const filtered = this._permissions.filter(
      (p) => p.getResource().toLowerCase() === resource.toLowerCase(),
    );
    return new PermissionsCollection(filtered);
  }

  filterByAction(action: string): PermissionsCollection {
    const filtered = this._permissions.filter(
      (p) => p.getAction().toLowerCase() === action.toLowerCase(),
    );
    return new PermissionsCollection(filtered);
  }

  getResources() {
    const resources = new Set(this._permissions.map((p) => p.getResource()));
    return Array.from(resources);
  }

  getActions() {
    const actions = new Set(this._permissions.map((p) => p.getAction()));
    return Array.from(actions);
  }

  getPermissionNames() {
    return this._permissions.map((p) => p.getPermissionName());
  }

  hasAdminPermissions() {
    const adminResources = ['user', 'role', 'permission', 'system'];
    const criticalActions = ['create', 'update', 'delete'];

    return this._permissions.some((p) => {
      const resource = p.getResource().toLowerCase();
      const action = p.getAction().toLowerCase();
      return adminResources.includes(resource) && criticalActions.includes(action);
    });
  }

  allowsAccess(resource: string, action: string) {
    return this._permissions.some((p) => p.allowsAction(resource, action));
  }

  get size() {
    return this._permissions.length;
  }

  get isEmpty() {
    return this._permissions.length === 0;
  }

  get permissions() {
    return this._permissions;
  }

  toArray() {
    return [...this._permissions];
  }

  *[Symbol.iterator]() {
    for (const permissions of this._permissions) {
      yield permissions;
    }
  }

  merge(other: PermissionsCollection): PermissionsCollection {
    const merged = [...this._permissions];
    for (const perm of other.permissions) {
      if (!this.contains(perm.id)) {
        merged.push(perm);
      }
    }
    return new PermissionsCollection(merged);
  }

  intersect(other: PermissionsCollection): PermissionsCollection {
    const intersection = this._permissions.filter((p) => other.contains(p.id));
    return new PermissionsCollection(intersection);
  }

  equals(other: PermissionsCollection): boolean {
    if (this.size !== other.size) {
      return false;
    }
    return this._permissions.every((p) => other.contains(p.id));
  }

  private validatePermissions(permissions: Permission[]) {
    const permissionIds = new Set<string>();
    const permissionNames = new Set<string>();

    for (const permission of permissions) {
      const id = permission.id.getValue();
      const name = permission.getPermissionName();

      if (permissionIds.has(id)) {
        throw new InvalidValueObjectException(`Duplicate permission ID found: ${id}`);
      }

      if (permissionNames.has(name)) {
        throw new InvalidValueObjectException(`Duplicate permission name found: ${name}`);
      }
      permissionIds.add(id);
      permissionNames.add(name);
    }
  }
}
