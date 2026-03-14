"use strict";
/**
 * Input validation utilities for API routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSlug = validateSlug;
exports.validateId = validateId;
exports.validatePageNumber = validatePageNumber;
exports.validatePageSize = validatePageSize;
exports.validateSearchQuery = validateSearchQuery;
function validateSlug(slug) {
    if (typeof slug !== 'string' || slug.trim().length === 0) {
        throw new Error('Invalid slug: must be a non-empty string');
    }
    // Only allow alphanumeric, hyphens, and underscores
    if (!/^[a-z0-9_-]+$/i.test(slug)) {
        throw new Error('Invalid slug: only alphanumeric, hyphens, and underscores allowed');
    }
    return slug.trim();
}
function validateId(id) {
    if (typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid ID: must be a non-empty string');
    }
    // UUID validation (basic)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        // If not UUID format, at least ensure it's alphanumeric
        if (!/^[a-z0-9_-]+$/i.test(id)) {
            throw new Error('Invalid ID format');
        }
    }
    return id.trim();
}
function validatePageNumber(page) {
    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
        return 1; // Default to page 1
    }
    return pageNum;
}
function validatePageSize(take, max = 100) {
    const size = Number(take);
    if (!Number.isInteger(size) || size < 1) {
        return 20; // Default page size
    }
    return Math.min(size, max); // Cap at max to prevent abuse
}
function validateSearchQuery(q) {
    if (typeof q !== 'string') {
        throw new Error('Search query must be a string');
    }
    const query = q.trim();
    if (query.length === 0) {
        throw new Error('Search query cannot be empty');
    }
    if (query.length > 200) {
        throw new Error('Search query too long (max 200 characters)');
    }
    return query;
}
//# sourceMappingURL=validation.js.map