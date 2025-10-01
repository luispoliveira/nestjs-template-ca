import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { FirstName, FullName, LastName, Name } from '../../name.vo';

describe('Name Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid name', () => {
      const name = new Name('John');

      expect(name).toBeDefined();
      expect(name.getValue()).toBe('John');
    });

    it('should trim whitespace from name', () => {
      const name = new Name('  John  ');

      expect(name.getValue()).toBe('John');
    });

    it('should throw InvalidValueObjectException for empty string', () => {
      expect(() => new Name('')).toThrow(InvalidValueObjectException);
      expect(() => new Name('')).toThrow('Invalid name format');
    });

    it('should throw InvalidValueObjectException for whitespace only string', () => {
      expect(() => new Name('   ')).toThrow(InvalidValueObjectException);
      expect(() => new Name('   ')).toThrow('Invalid name format');
    });

    it('should throw InvalidValueObjectException for names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => new Name(longName)).toThrow(InvalidValueObjectException);
      expect(() => new Name(longName)).toThrow('Invalid name format');
    });

    it('should accept names with exactly 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const name = new Name(maxName);

      expect(name.getValue()).toBe(maxName);
    });
  });

  describe('getValue', () => {
    it('should return the formatted name value', () => {
      const name = new Name('John');

      expect(name.getValue()).toBe('John');
    });
  });

  describe('equals', () => {
    it('should return true for same name values', () => {
      const name1 = new Name('John');
      const name2 = new Name('John');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different name values', () => {
      const name1 = new Name('John');
      const name2 = new Name('Jane');

      expect(name1.equals(name2)).toBe(false);
    });

    it('should handle trimmed names correctly', () => {
      const name1 = new Name('John');
      const name2 = new Name('  John  ');

      expect(name1.equals(name2)).toBe(true);
    });
  });
});

describe('FirstName Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid first name', () => {
      const firstName = new FirstName('John');

      expect(firstName).toBeDefined();
      expect(firstName.getValue()).toBe('John');
    });

    it('should inherit validation from Name', () => {
      expect(() => new FirstName('')).toThrow(InvalidValueObjectException);
      expect(() => new FirstName('   ')).toThrow(InvalidValueObjectException);
    });
  });
});

describe('LastName Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid last name', () => {
      const lastName = new LastName('Doe');

      expect(lastName).toBeDefined();
      expect(lastName.getValue()).toBe('Doe');
    });

    it('should inherit validation from Name', () => {
      expect(() => new LastName('')).toThrow(InvalidValueObjectException);
      expect(() => new LastName('   ')).toThrow(InvalidValueObjectException);
    });
  });
});

describe('FullName Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a full name with first and last name', () => {
      const firstName = new FirstName('John');
      const lastName = new LastName('Doe');
      const fullName = new FullName(firstName, lastName);

      expect(fullName).toBeDefined();
      expect(fullName.getFirstName()).toBe(firstName);
      expect(fullName.getLastName()).toBe(lastName);
    });
  });

  describe('getFirstName', () => {
    it('should return the first name', () => {
      const firstName = new FirstName('John');
      const lastName = new LastName('Doe');
      const fullName = new FullName(firstName, lastName);

      expect(fullName.getFirstName()).toBe(firstName);
      expect(fullName.getFirstName().getValue()).toBe('John');
    });
  });

  describe('getLastName', () => {
    it('should return the last name', () => {
      const firstName = new FirstName('John');
      const lastName = new LastName('Doe');
      const fullName = new FullName(firstName, lastName);

      expect(fullName.getLastName()).toBe(lastName);
      expect(fullName.getLastName().getValue()).toBe('Doe');
    });
  });

  describe('getFullName', () => {
    it('should return the concatenated full name', () => {
      const firstName = new FirstName('John');
      const lastName = new LastName('Doe');
      const fullName = new FullName(firstName, lastName);

      expect(fullName.getFullName()).toBe('John Doe');
    });

    it('should handle names with spaces correctly', () => {
      const firstName = new FirstName('Mary Jane');
      const lastName = new LastName('Watson');
      const fullName = new FullName(firstName, lastName);

      expect(fullName.getFullName()).toBe('Mary Jane Watson');
    });
  });
});
