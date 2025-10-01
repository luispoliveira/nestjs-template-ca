import { InvalidValueObjectException } from '../exceptions/domain-exceptions';
import { PermissionId } from '../value-objects/permission-id.vo';
import { PermissionName } from '../value-objects/permission-name.vo';
import { ResourceAction } from '../value-objects/resource-action.vo';

export class Permission {
  private readonly _id: PermissionId;
  private readonly _name: PermissionName;
  private _description: string;
  private readonly _resourceAction: ResourceAction;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: PermissionId,
    description: string,
    resourceAction: ResourceAction,
    createdAt?: Date,
  ) {
    this.validateDescription(description);

    this._id = id;
    this._name = PermissionName.create(resourceAction.getResource(), resourceAction.getAction());
    this._description = description;
    this._resourceAction = resourceAction;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = new Date();
  }

  static create(resourceAction: ResourceAction, description: string) {
    return new Permission(PermissionId.create(), description, resourceAction);
  }

  static fromData(data: {
    id: string;
    resourceAction: ResourceAction;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const permission = new Permission(
      PermissionId.fromString(data.id),
      data.description,
      data.resourceAction,
      data.createdAt,
    );
    permission._updatedAt = data.updatedAt;
    return permission;
  }

  get id(): PermissionId {
    return this._id;
  }

  get name(): PermissionName {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get resourceAction(): ResourceAction {
    return this._resourceAction;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateDescription(newDescription: string) {
    this.validateDescription(newDescription);
    if (this._description === newDescription) {
      return;
    }

    this._description = newDescription;
    this._updatedAt = new Date();
  }

  getResource(): string {
    return this._resourceAction.getResource();
  }

  getAction(): string {
    return this._resourceAction.getAction();
  }

  getPermissionName(): string {
    return this._name.getValue();
  }

  getStringName(): string {
    return this._name.getValue();
  }

  allowsAction(resource: string, action: string): boolean {
    return this.getResource() === resource && this.getAction() === action;
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
