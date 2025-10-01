import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { VerificationCode } from '../../verification-code.vo';

describe('VerificationCode Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid verification code with 6 digits', () => {
      const code = new VerificationCode('123456');

      expect(code).toBeDefined();
      expect(code.getValue()).toBe('123456');
    });

    it('should create a valid verification code with leading zeros', () => {
      const code = new VerificationCode('000123');

      expect(code).toBeDefined();
      expect(code.getValue()).toBe('000123');
    });

    it('should throw InvalidValueObjectException for empty string', () => {
      expect(() => new VerificationCode('')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for codes with less than 6 digits', () => {
      expect(() => new VerificationCode('12345')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('1')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for codes with more than 6 digits', () => {
      expect(() => new VerificationCode('1234567')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('12345678901')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for codes containing non-digit characters', () => {
      expect(() => new VerificationCode('12345a')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('abcdef')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('123-456')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('123 456')).toThrow(InvalidValueObjectException);
      expect(() => new VerificationCode('123.456')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException with correct error message', () => {
      expect(() => new VerificationCode('invalid')).toThrow('Invalid verification code format');
    });
  });

  describe('generate', () => {
    it('should generate a valid 6-digit verification code', () => {
      const code = VerificationCode.generate();

      expect(code).toBeDefined();
      expect(code.getValue()).toMatch(/^\d{6}$/);
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      const iterations = 100;

      // Generate multiple codes to test randomness
      for (let i = 0; i < iterations; i++) {
        const code = VerificationCode.generate();
        codes.add(code.getValue());
      }

      // We expect some variation, but not necessarily all unique due to randomness
      // With 1,000,000 possible combinations and 100 iterations, duplicates are unlikely
      expect(codes.size).toBeGreaterThan(1);
    });

    it('should generate codes within valid range (100000-999999)', () => {
      for (let i = 0; i < 10; i++) {
        const code = VerificationCode.generate();
        const numericValue = parseInt(code.getValue(), 10);

        expect(numericValue).toBeGreaterThanOrEqual(100000);
        expect(numericValue).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('getValue', () => {
    it('should return the original code value', () => {
      const codeValue = '654321';
      const code = new VerificationCode(codeValue);

      expect(code.getValue()).toBe(codeValue);
    });
  });

  describe('equals', () => {
    it('should return true for identical verification codes', () => {
      const code1 = new VerificationCode('123456');
      const code2 = new VerificationCode('123456');

      expect(code1.equals(code2)).toBe(true);
      expect(code2.equals(code1)).toBe(true);
    });

    it('should return false for different verification codes', () => {
      const code1 = new VerificationCode('123456');
      const code2 = new VerificationCode('654321');

      expect(code1.equals(code2)).toBe(false);
      expect(code2.equals(code1)).toBe(false);
    });

    it('should handle codes with leading zeros correctly', () => {
      const code1 = new VerificationCode('000123');
      const code2 = new VerificationCode('000123');
      const code3 = new VerificationCode('123000');

      expect(code1.equals(code2)).toBe(true);
      expect(code1.equals(code3)).toBe(false);
    });

    it('should work with self-comparison', () => {
      const code = new VerificationCode('123456');

      expect(code.equals(code)).toBe(true);
    });
  });

  describe('integration with generate', () => {
    it('should create equal objects from the same generated code', () => {
      const generatedCode = VerificationCode.generate();
      const manualCode = new VerificationCode(generatedCode.getValue());

      expect(generatedCode.equals(manualCode)).toBe(true);
      expect(manualCode.equals(generatedCode)).toBe(true);
    });
  });
});
