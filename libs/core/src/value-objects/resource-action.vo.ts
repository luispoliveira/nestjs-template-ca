import { InvalidValueObjectException } from '../exceptions/domain-exceptions';

export enum ResourceType {
  USER = 'user',
  ROLE = 'role',
}

export enum ActionType {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export class ResourceAction {
  private readonly resource: ResourceType;
  private readonly action: ActionType;

  constructor(resource: ResourceType | string, action: ActionType | string) {
    const resourceValue =
      typeof resource === 'string' ? this.parseResourceType(resource) : resource;

    const actionValue = typeof action === 'string' ? this.parseActionType(action) : action;

    if (!this.isValidResource(resourceValue)) {
      throw new InvalidValueObjectException(`Invalid resource: ${resourceValue}`);
    }

    this.resource = resourceValue;
    this.action = actionValue;
  }

  getResource(): ResourceType {
    return this.resource;
  }

  getAction(): ActionType {
    return this.action;
  }

  private isValidResource(resource: string) {
    return /^[a-z0-9-]+$/.test(resource) && resource.length > 0;
  }

  private parseResourceType(resource: string): ResourceType {
    if (Object.values(ResourceType).includes(resource as ResourceType)) {
      return resource as ResourceType;
    }

    throw new InvalidValueObjectException(`Invalid resource type: ${resource}`);
  }

  private parseActionType(action: string): ActionType {
    if (Object.values(ActionType).includes(action as ActionType)) {
      return action as ActionType;
    }

    throw new InvalidValueObjectException(`Invalid action type: ${action}`);
  }
}
