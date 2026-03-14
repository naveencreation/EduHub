import { describe, it, expect } from 'vitest';
import { validateSlug, validateId, validatePageNumber, validatePageSize, validateSearchQuery } from './validation';

describe('validation utilities', () => {
  describe('validateSlug', () => {
    it('returns trimmed slug when valid', () => {
      expect(validateSlug('  my-slug_123  ')).toBe('my-slug_123');
    });

    it('throws for empty string', () => {
      expect(() => validateSlug('')).toThrow('Invalid slug');
      expect(() => validateSlug('   ')).toThrow('Invalid slug');
    });

    it('throws for invalid characters', () => {
      expect(() => validateSlug('foo/bar')).toThrow('Invalid slug');
      expect(() => validateSlug('foo@bar')).toThrow('Invalid slug');
    });
  });

  describe('validateId', () => {
    it('returns trimmed id when valid uuid', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(validateId(`  ${uuid}  `)).toBe(uuid);
    });

    it('returns id when alphanumeric with dash/underscore', () => {
      expect(validateId('abc_123-xyz')).toBe('abc_123-xyz');
    });

    it('throws for invalid id', () => {
      expect(() => validateId('')).toThrow('Invalid ID');
      expect(() => validateId('   ')).toThrow('Invalid ID');
      expect(() => validateId('not valid!')).toThrow('Invalid ID');
    });
  });

  describe('validatePageNumber', () => {
    it('returns 1 for invalid values', () => {
      expect(validatePageNumber(undefined)).toBe(1);
      expect(validatePageNumber('abc')).toBe(1);
      expect(validatePageNumber(0)).toBe(1);
      expect(validatePageNumber(-5)).toBe(1);
    });

    it('returns numeric page for valid inputs', () => {
      expect(validatePageNumber(1)).toBe(1);
      expect(validatePageNumber('3')).toBe(3);
    });
  });

  describe('validatePageSize', () => {
    it('returns default for invalid values', () => {
      expect(validatePageSize(undefined)).toBe(20);
      expect(validatePageSize('abc')).toBe(20);
      expect(validatePageSize(0)).toBe(20);
    });

    it('caps at max', () => {
      expect(validatePageSize(9999, 50)).toBe(50);
    });

    it('returns numeric size for valid', () => {
      expect(validatePageSize(25)).toBe(25);
    });
  });

  describe('validateSearchQuery', () => {
    it('throws for non-string values', () => {
      expect(() => validateSearchQuery(undefined)).toThrow('Search query must be a string');
    });

    it('throws for empty string', () => {
      expect(() => validateSearchQuery('')).toThrow('Search query cannot be empty');
      expect(() => validateSearchQuery('    ')).toThrow('Search query cannot be empty');
    });

    it('throws for too long query', () => {
      expect(() => validateSearchQuery('a'.repeat(201))).toThrow('Search query too long');
    });

    it('returns trimmed query', () => {
      expect(validateSearchQuery('  hello world  ')).toBe('hello world');
    });
  });
});
