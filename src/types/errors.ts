import { z } from "zod";

/**
 * Individual API error detail
 */
export const APIErrorDetailSchema = z.object({
  message: z.string(),
  code: z.number().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
  parameter: z.string().optional(),
  value: z.string().optional(),
});

export type APIErrorDetail = z.infer<typeof APIErrorDetailSchema>;

/**
 * X API error response
 */
export const APIErrorResponseSchema = z.object({
  errors: z.array(APIErrorDetailSchema),
});

export type APIErrorResponse = z.infer<typeof APIErrorResponseSchema>;

/**
 * Error codes used by x-cli
 */
export const ErrorCode = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  AUTH_EXPIRED: "AUTH_EXPIRED",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION: "VALIDATION",
  API_ERROR: "API_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  CONFIG_ERROR: "CONFIG_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Base error class for x-cli
 */
export class XCLIError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode
  ) {
    super(message);
    this.name = "XCLIError";
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

/**
 * Authentication required or expired error
 */
export class AuthError extends XCLIError {
  constructor(message: string, expired = false) {
    super(message, expired ? ErrorCode.AUTH_EXPIRED : ErrorCode.AUTH_REQUIRED);
    this.name = "AuthError";
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends XCLIError {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message, ErrorCode.RATE_LIMITED);
    this.name = "RateLimitError";
  }
}

/**
 * X API error
 */
export class APIError extends XCLIError {
  constructor(
    message: string,
    public readonly details?: APIErrorDetail[]
  ) {
    super(message, ErrorCode.API_ERROR);
    this.name = "APIError";
  }
}

/**
 * Input validation error
 */
export class ValidationError extends XCLIError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, ErrorCode.VALIDATION);
    this.name = "ValidationError";
  }
}

/**
 * Configuration error
 */
export class ConfigError extends XCLIError {
  constructor(message: string) {
    super(message, ErrorCode.CONFIG_ERROR);
    this.name = "ConfigError";
  }
}

/**
 * Network/connectivity error
 */
export class NetworkError extends XCLIError {
  constructor(message: string) {
    super(message, ErrorCode.NETWORK_ERROR);
    this.name = "NetworkError";
  }
}
