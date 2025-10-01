import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { ActionType, ResourceAction, ResourceType } from '../../resource-action.vo';

describe('ResourceAction Value Object unit tests', () => {
  describe('constructor with enum values', () => {
    it('should create a valid resource action with enum values', () => {
      const resourceAction = new ResourceAction(ResourceType.USER, ActionType.READ);

      expect(resourceAction).toBeDefined();
      expect(resourceAction.getResource()).toBe(ResourceType.USER);
      expect(resourceAction.getAction()).toBe(ActionType.READ);
    });

    it('should create resource action with all valid resource types', () => {
      Object.values(ResourceType).forEach((resource) => {
        const resourceAction = new ResourceAction(resource, ActionType.READ);
        expect(resourceAction.getResource()).toBe(resource);
      });
    });

    it('should create resource action with all valid action types', () => {
      Object.values(ActionType).forEach((action) => {
        const resourceAction = new ResourceAction(ResourceType.USER, action);
        expect(resourceAction.getAction()).toBe(action);
      });
    });
  });

  describe('constructor with string values', () => {
    it('should create resource action from valid string values', () => {
      const resourceAction = new ResourceAction('user', 'read');

      expect(resourceAction.getResource()).toBe(ResourceType.USER);
      expect(resourceAction.getAction()).toBe(ActionType.READ);
    });

    it('should create resource action with role and all actions', () => {
      const actions = ['read', 'create', 'update', 'delete'];
      actions.forEach((action) => {
        const resourceAction = new ResourceAction('role', action);
        expect(resourceAction.getResource()).toBe(ResourceType.ROLE);
        expect(resourceAction.getAction()).toBe(action as ActionType);
      });
    });

    it('should throw InvalidValueObjectException for invalid resource type string', () => {
      expect(() => new ResourceAction('invalid-resource', 'read')).toThrow(
        InvalidValueObjectException,
      );
      expect(() => new ResourceAction('invalid-resource', 'read')).toThrow(
        'Invalid resource type: invalid-resource',
      );
    });

    it('should throw InvalidValueObjectException for invalid action type string', () => {
      expect(() => new ResourceAction('user', 'invalid-action')).toThrow(
        InvalidValueObjectException,
      );
      expect(() => new ResourceAction('user', 'invalid-action')).toThrow(
        'Invalid action type: invalid-action',
      );
    });

    it('should throw InvalidValueObjectException for empty resource', () => {
      expect(() => new ResourceAction('', 'read')).toThrow(InvalidValueObjectException);
      expect(() => new ResourceAction('', 'read')).toThrow('Invalid resource type: ');
    });

    it('should throw InvalidValueObjectException for resource with invalid characters', () => {
      expect(() => new ResourceAction('user_profile', 'read')).toThrow(InvalidValueObjectException);
      expect(() => new ResourceAction('user@domain', 'read')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for resource starting with number', () => {
      expect(() => new ResourceAction('123user', 'read')).toThrow(InvalidValueObjectException);
    });
  });

  describe('getResource', () => {
    it('should return the resource type', () => {
      const resourceAction = new ResourceAction(ResourceType.USER, ActionType.READ);

      expect(resourceAction.getResource()).toBe(ResourceType.USER);
    });

    it('should return the resource type from string input', () => {
      const resourceAction = new ResourceAction('role', 'create');

      expect(resourceAction.getResource()).toBe(ResourceType.ROLE);
    });
  });

  describe('getAction', () => {
    it('should return the action type', () => {
      const resourceAction = new ResourceAction(ResourceType.USER, ActionType.DELETE);

      expect(resourceAction.getAction()).toBe(ActionType.DELETE);
    });

    it('should return the action type from string input', () => {
      const resourceAction = new ResourceAction('user', 'update');

      expect(resourceAction.getAction()).toBe(ActionType.UPDATE);
    });
  });

  describe('ResourceType enum', () => {
    it('should have correct enum values', () => {
      expect(ResourceType.USER).toBe('user');
      expect(ResourceType.ROLE).toBe('role');
    });
  });

  describe('ActionType enum', () => {
    it('should have correct enum values', () => {
      expect(ActionType.READ).toBe('read');
      expect(ActionType.CREATE).toBe('create');
      expect(ActionType.UPDATE).toBe('update');
      expect(ActionType.DELETE).toBe('delete');
    });
  });
});
