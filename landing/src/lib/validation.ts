/**
 * Input validation utilities
 */

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

/**
 * Validate and sanitize string inputs
 */
export function validateString(
  value: unknown,
  options: {
    maxLength?: number
    minLength?: number
    pattern?: RegExp
    fieldName?: string
  } = {}
): ValidationResult {
  const { maxLength = 1000, minLength = 0, pattern, fieldName = 'Field' } = options

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` }
  }

  const trimmed = value.trim()

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` }
  }

  if (pattern && !pattern.test(trimmed)) {
    return { valid: false, error: `${fieldName} has invalid format` }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Validate ID format (alphanumeric, dashes, underscores, colons)
 */
export function validateId(value: unknown, fieldName = 'ID'): ValidationResult {
  return validateString(value, {
    maxLength: 200,
    minLength: 1,
    pattern: /^[a-zA-Z0-9_:.-]+$/,
    fieldName,
  })
}

/**
 * Validate boolean
 */
export function validateBoolean(value: unknown, fieldName = 'Field'): ValidationResult {
  if (typeof value !== 'boolean') {
    return { valid: false, error: `${fieldName} must be a boolean` }
  }
  return { valid: true, sanitized: String(value) }
}

/**
 * Validate GitHub username or repo name
 */
export function validateGitHubName(value: string, fieldName = 'Name'): ValidationResult {
  // GitHub allows alphanumeric, hyphens, and underscores
  // No dots in beginning/end, no consecutive dots
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/

  if (!pattern.test(value)) {
    return { valid: false, error: `${fieldName} has invalid format` }
  }

  // Prevent path traversal
  if (value.includes('..') || value.includes('/') || value.includes('\\')) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }

  return { valid: true, sanitized: value }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string,
  status = 500
): Response {
  const message = error instanceof Error ? error.message : defaultMessage
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
