import { UserId } from '../../user-id.vo';

describe('UserId Value Object unit tests', () => {
  describe('create', () => {
    it('should create a new user id when no value is provided', () => {
      const userId = UserId.create();

      expect(userId).toBeDefined();
      expect(userId.getValue()).toBeDefined();
      expect(typeof userId.getValue()).toBe('string');
      expect(userId.getValue().length).toBeGreaterThan(0);
    });

    it('should use provided value when creating with value', () => {
      const customValue = 'custom-user-id-123';
      const userId = UserId.create(customValue);

      expect(userId.getValue()).toBe(customValue);
    });

    it('should generate unique ids when called multiple times', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();

      expect(userId1.getValue()).not.toBe(userId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create user id from string', () => {
      const value = 'user-id-from-string';
      const userId = UserId.fromString(value);

      expect(userId.getValue()).toBe(value);
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.fromString('')).toThrow('UserId cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => UserId.fromString('   ')).toThrow('UserId cannot be empty');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const value = 'test-user-id';
      const userId = UserId.fromString(value);

      expect(userId.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const value = 'same-user-id';
      const userId1 = UserId.fromString(value);
      const userId2 = UserId.fromString(value);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const userId1 = UserId.fromString('user-id-1');
      const userId2 = UserId.fromString('user-id-2');

      expect(userId1.equals(userId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the value', () => {
      const value = 'test-user-id-string';
      const userId = UserId.fromString(value);

      expect(userId.toString()).toBe(value);
    });
  });
});
