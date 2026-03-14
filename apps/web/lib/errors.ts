/**
 * Utility for consistent error handling across the app
 * Converts various error types to user-friendly messages
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Extract error message from any error type
 * Works with: Error, AxiosError, string, etc.
 */
export function getErrorMessage(error: unknown): string {
  // Error instance
  if (error instanceof Error) {
    return error.message;
  }

  // Axios error with response
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response === "object"
  ) {
    const response = (error as any).response;
    if (response?.data?.error) {
      return response.data.error;
    }
    if (response?.statusText) {
      return response.statusText;
    }
  }

  // Axios error message
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as any).message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  // Fallback
  return "An unknown error occurred. Please try again.";
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatus(error: unknown): number {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response === "object"
  ) {
    return (error as any).response?.status || 500;
  }

  return 500;
}

/**
 * Check if error is a 401 Unauthorized
 */
export function isUnauthorizedError(error: unknown): boolean {
  return getErrorStatus(error) === 401;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "message" in error) &&
    (String((error as any).message).includes("Network") ||
      String((error as any).message).includes("ERR_"))
  );
}
