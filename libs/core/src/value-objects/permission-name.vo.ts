import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export class PermissionName {
  private readonly value: string;
  private readonly resource: string;
  private readonly action: string;

  constructor(permissionName: string) {
    if (!this.isValid(permissionName)) {
      throw new InvalidValueObjectException('Permission name must be in format "resource:action"');
    }
    this.value = permissionName;
    const [resource, action] = permissionName.split(':');
    this.resource = resource;
    this.action = action;
  }

  static create(resource: string, action: string): PermissionName {
    return new PermissionName(`${resource}:${action}`);
  }

  getValue(): string {
    return this.value;
  }

  getResource(): string {
    return this.resource;
  }

  getAction(): string {
    return this.action;
  }

  equals(permissionName: PermissionName): boolean {
    return this.value === permissionName.getValue();
  }

  private isValid(permissionName: string): boolean {
    // Permission name must be in format 'resource:action'
    return /^[a-z0-9-]+:[a-z0-9-]+$/.test(permissionName);
  }
}
