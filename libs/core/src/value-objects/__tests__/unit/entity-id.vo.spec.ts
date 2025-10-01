import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { EntityId } from '../../entity-id.vo';

// Concrete implementation for testing
class TestEntityId extends EntityId {
  constructor(value: string) {
    super(value);
  }

  static create(value?: string): TestEntityId {
    return new TestEntityId(value ?? EntityId.generateId());
  }

  static fromString(value: string): TestEntityId {
    return new TestEntityId(value);
  }
}

describe('EntityId Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid entity id', () => {
      const id = new TestEntityId('test-id-123');

      expect(id).toBeDefined();
      expect(id.getValue()).toBe('test-id-123');
    });

    it('should throw InvalidValueObjectException for empty string', () => {
      expect(() => new TestEntityId('')).toThrow(InvalidValueObjectException);
      expect(() => new TestEntityId('')).toThrow('TestEntityId cannot be empty');
    });

    it('should throw InvalidValueObjectException for whitespace only string', () => {
      expect(() => new TestEntityId('   ')).toThrow(InvalidValueObjectException);
      expect(() => new TestEntityId('   ')).toThrow('TestEntityId cannot be empty');
    });
  });

  describe('static methods', () => {
    it('should generate a new id when no value is provided', () => {
      const id = TestEntityId.create();

      expect(id).toBeDefined();
      expect(id.getValue()).toBeDefined();
      expect(typeof id.getValue()).toBe('string');
      expect(id.getValue().length).toBeGreaterThan(0);
    });

    it('should use provided value when creating with value', () => {
      const customValue = 'custom-id-456';
      const id = TestEntityId.create(customValue);

      expect(id.getValue()).toBe(customValue);
    });

    it('should create from string', () => {
      const value = 'string-id-789';
      const id = TestEntityId.fromString(value);

      expect(id.getValue()).toBe(value);
    });

    it('should generate unique ids', () => {
      const id1 = TestEntityId.create();
      const id2 = TestEntityId.create();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const value = 'test-value';
      const id = new TestEntityId(value);

      expect(id.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true for same values and same type', () => {
      const value = 'same-value';
      const id1 = new TestEntityId(value);
      const id2 = new TestEntityId(value);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = new TestEntityId('value1');
      const id2 = new TestEntityId('value2');

      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false for different types even with same value', () => {
      class AnotherTestEntityId extends EntityId {
        constructor(value: string) {
          super(value);
        }
      }

      const value = 'same-value';
      const id1 = new TestEntityId(value);
      const id2 = new AnotherTestEntityId(value);

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the value', () => {
      const value = 'test-string-value';
      const id = new TestEntityId(value);

      expect(id.toString()).toBe(value);
    });
  });
});
