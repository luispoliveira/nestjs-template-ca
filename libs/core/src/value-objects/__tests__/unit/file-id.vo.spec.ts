import { FileId } from '../../file-id.vo';

describe('FileId Value Object unit tests', () => {
  describe('create', () => {
    it('should create a new file id when no value is provided', () => {
      const fileId = FileId.create();

      expect(fileId).toBeDefined();
      expect(fileId.getValue()).toBeDefined();
      expect(typeof fileId.getValue()).toBe('string');
      expect(fileId.getValue().length).toBeGreaterThan(0);
    });

    it('should use provided value when creating with value', () => {
      const customValue = 'custom-file-id-123';
      const fileId = FileId.create(customValue);

      expect(fileId.getValue()).toBe(customValue);
    });

    it('should generate unique ids when called multiple times', () => {
      const fileId1 = FileId.create();
      const fileId2 = FileId.create();

      expect(fileId1.getValue()).not.toBe(fileId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create file id from string', () => {
      const value = 'file-id-from-string';
      const fileId = FileId.fromString(value);

      expect(fileId.getValue()).toBe(value);
    });

    it('should throw error for empty string', () => {
      expect(() => FileId.fromString('')).toThrow('FileId cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => FileId.fromString('   ')).toThrow('FileId cannot be empty');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const value = 'test-file-id';
      const fileId = FileId.fromString(value);

      expect(fileId.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const value = 'same-file-id';
      const fileId1 = FileId.fromString(value);
      const fileId2 = FileId.fromString(value);

      expect(fileId1.equals(fileId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const fileId1 = FileId.fromString('file-id-1');
      const fileId2 = FileId.fromString('file-id-2');

      expect(fileId1.equals(fileId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the value', () => {
      const value = 'test-file-id-string';
      const fileId = FileId.fromString(value);

      expect(fileId.toString()).toBe(value);
    });
  });
});
