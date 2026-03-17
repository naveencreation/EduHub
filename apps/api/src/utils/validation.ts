/**
 * Input validation utilities for API routes
 */

export function validateSlug(slug: unknown): string {
  if (typeof slug !== 'string' || slug.trim().length === 0) {
    throw new Error('Invalid slug: must be a non-empty string');
  }

  const normalized = slug.trim();

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-z0-9_-]+$/i.test(normalized)) {
    throw new Error('Invalid slug: only alphanumeric, hyphens, and underscores allowed');
  }
  return normalized;
}

export function validateId(id: unknown): string {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('Invalid ID: must be a non-empty string');
  }

  const normalized = id.trim();

  // UUID validation (basic)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalized)) {
    // If not UUID format, at least ensure it's alphanumeric
    if (!/^[a-z0-9_-]+$/i.test(normalized)) {
      throw new Error('Invalid ID format');
    }
  }
  return normalized;
}

export function validatePageNumber(page: unknown): number {
  const pageNum = Number(page);
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    return 1; // Default to page 1
  }
  return pageNum;
}

export function validatePageSize(take: unknown, max = 100): number {
  const size = Number(take);
  if (!Number.isInteger(size) || size < 1) {
    return 20; // Default page size
  }
  return Math.min(size, max); // Cap at max to prevent abuse
}

export function validateSearchQuery(q: unknown): string {
  if (typeof q !== 'string') {
    throw new TypeError('Search query must be a string');
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
