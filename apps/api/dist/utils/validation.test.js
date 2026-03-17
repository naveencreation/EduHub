"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validation_1 = require("./validation");
(0, vitest_1.describe)('validation utilities', () => {
    (0, vitest_1.describe)('validateSlug', () => {
        (0, vitest_1.it)('returns trimmed slug when valid', () => {
            (0, vitest_1.expect)((0, validation_1.validateSlug)('  my-slug_123  ')).toBe('my-slug_123');
        });
        (0, vitest_1.it)('throws for empty string', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateSlug)('')).toThrow('Invalid slug');
            (0, vitest_1.expect)(() => (0, validation_1.validateSlug)('   ')).toThrow('Invalid slug');
        });
        (0, vitest_1.it)('throws for invalid characters', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateSlug)('foo/bar')).toThrow('Invalid slug');
            (0, vitest_1.expect)(() => (0, validation_1.validateSlug)('foo@bar')).toThrow('Invalid slug');
        });
    });
    (0, vitest_1.describe)('validateId', () => {
        (0, vitest_1.it)('returns trimmed id when valid uuid', () => {
            const uuid = '123e4567-e89b-12d3-a456-426614174000';
            (0, vitest_1.expect)((0, validation_1.validateId)(`  ${uuid}  `)).toBe(uuid);
        });
        (0, vitest_1.it)('returns id when alphanumeric with dash/underscore', () => {
            (0, vitest_1.expect)((0, validation_1.validateId)('abc_123-xyz')).toBe('abc_123-xyz');
        });
        (0, vitest_1.it)('throws for invalid id', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateId)('')).toThrow('Invalid ID');
            (0, vitest_1.expect)(() => (0, validation_1.validateId)('   ')).toThrow('Invalid ID');
            (0, vitest_1.expect)(() => (0, validation_1.validateId)('not valid!')).toThrow('Invalid ID');
        });
    });
    (0, vitest_1.describe)('validatePageNumber', () => {
        (0, vitest_1.it)('returns 1 for invalid values', () => {
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)(undefined)).toBe(1);
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)('abc')).toBe(1);
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)(0)).toBe(1);
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)(-5)).toBe(1);
        });
        (0, vitest_1.it)('returns numeric page for valid inputs', () => {
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)(1)).toBe(1);
            (0, vitest_1.expect)((0, validation_1.validatePageNumber)('3')).toBe(3);
        });
    });
    (0, vitest_1.describe)('validatePageSize', () => {
        (0, vitest_1.it)('returns default for invalid values', () => {
            (0, vitest_1.expect)((0, validation_1.validatePageSize)(undefined)).toBe(20);
            (0, vitest_1.expect)((0, validation_1.validatePageSize)('abc')).toBe(20);
            (0, vitest_1.expect)((0, validation_1.validatePageSize)(0)).toBe(20);
        });
        (0, vitest_1.it)('caps at max', () => {
            (0, vitest_1.expect)((0, validation_1.validatePageSize)(9999, 50)).toBe(50);
        });
        (0, vitest_1.it)('returns numeric size for valid', () => {
            (0, vitest_1.expect)((0, validation_1.validatePageSize)(25)).toBe(25);
        });
    });
    (0, vitest_1.describe)('validateSearchQuery', () => {
        (0, vitest_1.it)('throws for non-string values', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateSearchQuery)(undefined)).toThrow('Search query must be a string');
        });
        (0, vitest_1.it)('throws for empty string', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateSearchQuery)('')).toThrow('Search query cannot be empty');
            (0, vitest_1.expect)(() => (0, validation_1.validateSearchQuery)('    ')).toThrow('Search query cannot be empty');
        });
        (0, vitest_1.it)('throws for too long query', () => {
            (0, vitest_1.expect)(() => (0, validation_1.validateSearchQuery)('a'.repeat(201))).toThrow('Search query too long');
        });
        (0, vitest_1.it)('returns trimmed query', () => {
            (0, vitest_1.expect)((0, validation_1.validateSearchQuery)('  hello world  ')).toBe('hello world');
        });
    });
});
//# sourceMappingURL=validation.test.js.map