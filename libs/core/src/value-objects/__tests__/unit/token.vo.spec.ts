import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { Token } from '../../token.vo';

describe('Token Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid token with UUID format', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const token = new Token(validUuid);

      expect(token).toBeDefined();
      expect(token.getValue()).toBe(validUuid);
    });

    it('should accept various valid UUID formats', () => {
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '00000000-0000-0000-0000-000000000000',
      ];

      validUuids.forEach((uuid) => {
        const token = new Token(uuid);
        expect(token.getValue()).toBe(uuid);
      });
    });

    it('should throw InvalidValueObjectException for invalid UUID format', () => {
      const invalidTokens = [
        'invalid-token',
        '550e8400-e29b-41d4-a716-44665544000', // Missing character
        '550e8400-e29b-41d4-a716-4466554400000', // Extra character
        '550e8400-e29b-41d4-a716', // Incomplete
        'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', // Invalid characters
        '', // Empty string
        '550e8400e29b41d4a716446655440000', // No hyphens
      ];

      invalidTokens.forEach((invalidToken) => {
        expect(() => new Token(invalidToken)).toThrow(InvalidValueObjectException);
        expect(() => new Token(invalidToken)).toThrow('Invalid token format');
      });
    });
  });

  describe('generate', () => {
    it('should generate a valid token', () => {
      const token = Token.generate();

      expect(token).toBeDefined();
      expect(token.getValue()).toBeDefined();
      expect(typeof token.getValue()).toBe('string');
      expect(token.getValue().length).toBe(36); // UUID length with hyphens
    });

    it('should generate unique tokens', () => {
      const token1 = Token.generate();
      const token2 = Token.generate();

      expect(token1.getValue()).not.toBe(token2.getValue());
    });

    it('should generate tokens in valid UUID format', () => {
      const token = Token.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(token.getValue())).toBe(true);
    });

    it('should generate multiple valid tokens', () => {
      const tokens = Array.from({ length: 10 }, () => Token.generate());
      const uniqueValues = new Set(tokens.map((token) => token.getValue()));

      expect(uniqueValues.size).toBe(10); // All tokens should be unique
      tokens.forEach((token) => {
        expect(token.getValue().length).toBe(36);
      });
    });
  });

  describe('getValue', () => {
    it('should return the token value', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const token = new Token(validUuid);

      expect(token.getValue()).toBe(validUuid);
    });

    it('should return the exact value without modification', () => {
      const validUuid = '6BA7B810-9DAD-11D1-80B4-00C04FD430C8'; // Uppercase
      const token = new Token(validUuid);

      expect(token.getValue()).toBe(validUuid);
    });
  });

  describe('equals', () => {
    it('should return true for same token values', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const token1 = new Token(validUuid);
      const token2 = new Token(validUuid);

      expect(token1.equals(token2)).toBe(true);
    });

    it('should return false for different token values', () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      const token1 = new Token(uuid1);
      const token2 = new Token(uuid2);

      expect(token1.equals(token2)).toBe(false);
    });

    it('should be case sensitive for equals comparison', () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '550E8400-E29B-41D4-A716-446655440000';
      const token1 = new Token(uuid1);
      const token2 = new Token(uuid2);

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return true when comparing with itself', () => {
      const token = Token.generate();

      expect(token.equals(token)).toBe(true);
    });
  });
});
