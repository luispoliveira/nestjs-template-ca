import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { ThrottleLimit } from '../../throttle-limit.vo';

describe('ThrottleLimit Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid throttle limit', () => {
      const throttleLimit = ThrottleLimit.create(60, 100);

      expect(throttleLimit).toBeDefined();
      expect(throttleLimit.getTtl).toBe(60);
      expect(throttleLimit.getLimit).toBe(100);
    });

    it('should throw InvalidValueObjectException for zero TTL', () => {
      expect(() => ThrottleLimit.create(0, 100)).toThrow(InvalidValueObjectException);
      expect(() => ThrottleLimit.create(0, 100)).toThrow('TTL must be greater than 0');
    });

    it('should throw InvalidValueObjectException for negative TTL', () => {
      expect(() => ThrottleLimit.create(-1, 100)).toThrow(InvalidValueObjectException);
      expect(() => ThrottleLimit.create(-1, 100)).toThrow('TTL must be greater than 0');
    });

    it('should throw InvalidValueObjectException for zero limit', () => {
      expect(() => ThrottleLimit.create(60, 0)).toThrow(InvalidValueObjectException);
      expect(() => ThrottleLimit.create(60, 0)).toThrow('Limit must be greater than 0');
    });

    it('should throw InvalidValueObjectException for negative limit', () => {
      expect(() => ThrottleLimit.create(60, -1)).toThrow(InvalidValueObjectException);
      expect(() => ThrottleLimit.create(60, -1)).toThrow('Limit must be greater than 0');
    });

    it('should accept minimum valid values', () => {
      const throttleLimit = ThrottleLimit.create(1, 1);

      expect(throttleLimit.getTtl).toBe(1);
      expect(throttleLimit.getLimit).toBe(1);
    });

    it('should accept large values', () => {
      const throttleLimit = ThrottleLimit.create(3600, 10000);

      expect(throttleLimit.getTtl).toBe(3600);
      expect(throttleLimit.getLimit).toBe(10000);
    });
  });

  describe('create', () => {
    it('should create throttle limit with specified values', () => {
      const throttleLimit = ThrottleLimit.create(120, 200);

      expect(throttleLimit.getTtl).toBe(120);
      expect(throttleLimit.getLimit).toBe(200);
    });
  });

  describe('createDefault', () => {
    it('should create throttle limit with default values', () => {
      const throttleLimit = ThrottleLimit.createDefault();

      expect(throttleLimit.getTtl).toBe(60);
      expect(throttleLimit.getLimit).toBe(60);
    });
  });

  describe('getTtl', () => {
    it('should return the TTL value', () => {
      const throttleLimit = ThrottleLimit.create(90, 150);

      expect(throttleLimit.getTtl).toBe(90);
    });
  });

  describe('getLimit', () => {
    it('should return the limit value', () => {
      const throttleLimit = ThrottleLimit.create(90, 150);

      expect(throttleLimit.getLimit).toBe(150);
    });
  });

  describe('toString', () => {
    it('should return a human-readable string representation', () => {
      const throttleLimit = ThrottleLimit.create(60, 100);

      expect(throttleLimit.toString()).toBe('100 requests per 60 seconds');
    });

    it('should return correct string for different values', () => {
      const throttleLimit = ThrottleLimit.create(1, 1);

      expect(throttleLimit.toString()).toBe('1 requests per 1 seconds');
    });

    it('should return correct string for default values', () => {
      const throttleLimit = ThrottleLimit.createDefault();

      expect(throttleLimit.toString()).toBe('60 requests per 60 seconds');
    });
  });
});
