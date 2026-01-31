# Next.js Security Audit Checklist

**Extracted:** 2026-01-29
**Context:** Comprehensive security hardening for Next.js + Drizzle + JWT applications

## Problem

Next.js applications with database access and authentication often have common security vulnerabilities:
- Insecure JWT secret fallbacks
- Timing attack vulnerabilities in authentication
- Missing input validation for database IDs
- Lack of Zod schemas for API validation
- Insufficient type checking before database operations

## Solution

### CRITICAL Fixes (Must Fix Immediately)

#### 1. JWT Secret Enforcement

**Problem:** Hardcoded fallback secrets allow session forgery in production

```typescript
// ❌ WRONG - Insecure fallback
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);
```

**Fix:**
```typescript
// ✅ CORRECT - Fail fast in production
const rawSecret = process.env.AUTH_SECRET || process.env.ENCRYPTION_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL: AUTH_SECRET must be set in production");
}

const SECRET_KEY = new TextEncoder().encode(
  rawSecret || "dev-only-fallback-secret-not-for-production"
);
```

**Files to check:**
- `src/lib/auth.ts`
- `src/middleware.ts`

#### 2. Array Element Validation

**Problem:** Array elements not validated as integers before database queries

```typescript
// ❌ WRONG - No element validation
if (!siteIds || !Array.isArray(siteIds) || siteIds.length === 0) {
  return error("Site IDs required");
}
```

**Fix:**
```typescript
// ✅ CORRECT - Validate each element
if (
  !siteIds ||
  !Array.isArray(siteIds) ||
  siteIds.length === 0 ||
  !siteIds.every((id) => typeof id === "number" && Number.isInteger(id) && id > 0)
) {
  return NextResponse.json(
    { error: "All site IDs must be valid positive integers" },
    { status: 400 }
  );
}
```

#### 3. ID Parameter Type Validation

**Problem:** ID parameters not validated as positive integers

```typescript
// ❌ WRONG - Only checks truthiness
const { tagId } = await request.json();
if (!tagId) {
  return error("Tag ID required");
}
```

**Fix:**
```typescript
// ✅ CORRECT - Full type validation
const body = await request.json();
const tagId = body.tagId;

if (typeof tagId !== "number" || !Number.isInteger(tagId) || tagId <= 0) {
  return NextResponse.json(
    { error: "Valid tag ID (positive integer) is required" },
    { status: 400 }
  );
}
```

### HIGH Priority Fixes (Should Fix Soon)

#### 4. Timing-Safe Password Comparison

**Problem:** Direct string comparison vulnerable to timing attacks

```typescript
// ❌ WRONG - Timing attack vulnerable
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return password === adminPassword;  // Timing attack!
}
```

**Fix:**
```typescript
// ✅ CORRECT - Constant-time comparison
import { timingSafeEqual } from "crypto";

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD not set");
    return true;
  }

  const passwordBuffer = Buffer.from(password);
  const adminBuffer = Buffer.from(adminPassword);

  if (passwordBuffer.length !== adminBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, adminBuffer);
}
```

#### 5. Comprehensive Zod Validation

**Problem:** API routes accept arbitrary JSON without validation

```typescript
// ❌ WRONG - No validation
const { type, enabled, config } = await request.json();
if (!type) {
  return error("Type required");
}
```

**Fix:**
```typescript
// ✅ CORRECT - Zod schema validation
import { z } from "zod";

const schema = z.object({
  type: z.enum(["email", "slack", "discord", "webhook"]),
  enabled: z.boolean().optional().default(true),
  config: z.record(z.string(), z.unknown()).optional(),
  events: z.array(z.string()).optional(),
});

const result = schema.safeParse(await request.json());
if (!result.success) {
  return NextResponse.json(
    { error: "Validation failed", details: result.error.issues },
    { status: 400 }
  );
}

const { type, enabled, config, events } = result.data;
```

## Complete Audit Checklist

### Authentication & Secrets
- [ ] JWT secrets enforced in production (no fallbacks)
- [ ] Password comparison uses `timingSafeEqual()`
- [ ] API keys stored in environment variables
- [ ] No secrets in git history
- [ ] `.env.local` in `.gitignore`

### Input Validation
- [ ] All array elements validated as correct types
- [ ] All ID parameters validated as positive integers
- [ ] Zod schemas for all POST/PUT/PATCH endpoints
- [ ] Email validation using Zod `.email()`
- [ ] URL validation using Zod `.url()`
- [ ] String length limits enforced

### Database Operations
- [ ] Parameterized queries only (Drizzle ORM handles this)
- [ ] No raw SQL with string concatenation
- [ ] Foreign key constraints in schema
- [ ] Proper error handling for database operations

### API Routes
- [ ] Rate limiting on authentication endpoints
- [ ] CSRF protection (Next.js handles for same-origin)
- [ ] Proper error sanitization (no stack traces to client)
- [ ] Bulk operation limits enforced
- [ ] Consistent error response format

### Security Headers
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

## Example Files to Audit

```bash
# Critical files to check
src/lib/auth.ts           # JWT, password verification
src/middleware.ts         # Authentication, rate limiting
src/app/api/**/route.ts   # All API routes

# Run this grep to find potential issues
grep -r "process.env.*||" src/  # Find fallback secrets
grep -r "=== " src/lib/auth.ts  # Find timing-vulnerable comparisons
grep -r "parseInt\|Number(" src/app/api/  # Find unvalidated ID parsing
grep -r "await request.json()" src/app/api/  # Find unvalidated input
```

## Validation Pattern Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeError, apiError } from "@/lib/api-utils";

// Define schema
const schema = z.object({
  // Add your fields with proper validation
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const validated = result.data;

    // Use validated data only
    // ... your logic here

  } catch (error) {
    console.error("Operation failed:", sanitizeError(error));
    return apiError("Operation failed");
  }
}
```

## When to Use

- Before deploying to production
- After adding any new API endpoints
- When code review finds security issues
- Monthly security audits
- After updating authentication logic
- When handling user input or sensitive data

## Prevention

1. **Use this checklist for all new API routes**
2. **Add Zod schemas before writing route logic**
3. **Never trust input - validate everything**
4. **Use TypeScript strict mode**
5. **Enable ESLint security rules**
6. **Run automated security scans (npm audit, Snyk)**

## Tools

```bash
# Check for security issues
npm audit

# TypeScript strict checking
tsc --noEmit --strict

# Find potential SQL injection (even with ORM, good to check)
grep -r "db.execute" src/

# Find console.log statements (shouldn't be in production)
grep -r "console.log" src/
```

## Related Patterns

- OWASP Top 10 checklist
- Next.js security best practices
- Drizzle ORM security patterns
- JWT security best practices
