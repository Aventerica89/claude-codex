---
description: API endpoint security audit. Checks authentication, authorization, input validation, and rate limiting on all routes.
---

# API Security Audit

Comprehensive security review of API endpoints.

## Usage

```bash
/security:api-security              # Full API audit
/security:api-security --auth       # Auth checks only
/security:api-security --routes     # List all routes
```

## When to Run

| Trigger | Priority |
|---------|----------|
| New API endpoint added | Required |
| Auth logic changed | Required |
| Before deployment | Required |
| After security incident | Required |
| Monthly audit | Recommended |

---

## What Gets Checked

### 1. Authentication

- All protected routes require auth
- Auth middleware is applied correctly
- No auth bypass paths
- Token validation is secure
- Session management is safe

### 2. Authorization

- Users can only access own resources
- Role-based access control works
- No privilege escalation possible
- Object-level authorization (BOLA)

### 3. Input Validation

- All inputs are validated
- Type checking enforced
- Size limits set
- Dangerous characters sanitized
- No SQL/NoSQL injection possible

### 4. Rate Limiting

- Rate limits on all endpoints
- Per-user/IP limits
- Stricter limits on sensitive endpoints
- Proper 429 responses

### 5. Error Handling

- No sensitive data in errors
- Consistent error format
- No stack traces in production
- Proper HTTP status codes

---

## Scan Process

### Step 1: Discover API Routes

```bash
# Next.js App Router
find src/app/api -name "route.ts" -o -name "route.js"

# Express
grep -rn "app\.(get|post|put|delete|patch)" src/

# List all endpoints
```

### Step 2: Check Each Endpoint

For each route, verify:

```typescript
// Authentication check
export async function GET(req: Request) {
  const session = await getSession(req)  // ✅ Auth check
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

### Step 3: Test Authorization

```typescript
// Object-level authorization
export async function GET(req: Request, { params }) {
  const session = await getSession(req)
  const resource = await getResource(params.id)

  // ✅ Check ownership
  if (resource.userId !== session.userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  // ...
}
```

### Step 4: Validate Input

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive().max(1000000)
})

export async function POST(req: Request) {
  const body = await req.json()
  const validated = schema.parse(body)  // ✅ Input validation
  // ...
}
```

### Step 5: Check Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ...
}
```

---

## Output Format

```markdown
## API Security Audit Report

**Project**: {project-name}
**Endpoints**: {count}
**Time**: {timestamp}

### Summary

| Category | Pass | Fail | Total |
|----------|------|------|-------|
| Authentication | 12 | 2 | 14 |
| Authorization | 10 | 3 | 13 |
| Input Validation | 8 | 5 | 13 |
| Rate Limiting | 5 | 8 | 13 |
| Error Handling | 11 | 2 | 13 |

**Risk Level**: 🔴 HIGH (5 critical issues)

---

### Endpoint Inventory

| Method | Path | Auth | Rate Limit | Status |
|--------|------|------|------------|--------|
| GET | /api/users | ✅ | ❌ | ⚠️ |
| POST | /api/users | ✅ | ✅ | ✅ |
| GET | /api/admin/* | ❌ | ❌ | ❌ |
| POST | /api/webhook | ❌ | ✅ | ⚠️ |

---

### Critical Issues

#### 1. Missing Authentication: /api/admin/*
**Severity**: CRITICAL
**File**: `src/app/api/admin/route.ts`

**Issue**: Admin endpoints have no authentication check.

**Current Code**:
```typescript
export async function GET(req: Request) {
  const users = await db.select().from(users)
  return Response.json(users)  // ❌ No auth!
}
```

**Fixed Code**:
```typescript
import { requireAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await requireAdmin(req)  // ✅ Auth check
  if (!session) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  const users = await db.select().from(users)
  return Response.json(users)
}
```

---

#### 2. Missing Object Authorization: /api/users/[id]
**Severity**: CRITICAL
**File**: `src/app/api/users/[id]/route.ts`

**Issue**: Any authenticated user can access any user's data (BOLA/IDOR).

**Current Code**:
```typescript
export async function GET(req: Request, { params }) {
  const user = await getUser(params.id)  // ❌ No ownership check
  return Response.json(user)
}
```

**Fixed Code**:
```typescript
export async function GET(req: Request, { params }) {
  const session = await getSession(req)
  const user = await getUser(params.id)

  if (user.id !== session.userId && !session.isAdmin) {  // ✅ Check
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return Response.json(user)
}
```

---

### High Issues

#### 1. No Input Validation: POST /api/payments
**Severity**: HIGH
**File**: `src/app/api/payments/route.ts`

**Issue**: Payment amount not validated, could be negative or excessive.

**Fixed Code**:
```typescript
const schema = z.object({
  amount: z.number().positive().max(1000000),
  currency: z.enum(['USD', 'EUR', 'GBP'])
})
```

---

### Missing Rate Limiting

| Endpoint | Risk | Recommendation |
|----------|------|----------------|
| POST /api/login | Brute force | 5 req/min |
| POST /api/register | Spam | 3 req/min |
| POST /api/forgot-password | Enum attack | 3 req/hour |
| POST /api/payments | Abuse | 10 req/min |

**Implementation**:
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m')
})

export const paymentLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m')
})
```

---

### Recommendations

1. Add authentication middleware to all `/api/admin/*` routes
2. Implement object-level authorization checks
3. Add Zod validation to all POST/PUT endpoints
4. Implement rate limiting with Upstash or similar
5. Add request logging for security monitoring

### Security Checklist

- [ ] All endpoints require authentication (except public)
- [ ] Object-level authorization on all resource access
- [ ] Input validation with Zod or similar
- [ ] Rate limiting on all endpoints
- [ ] No sensitive data in error responses
- [ ] Proper HTTP status codes
- [ ] Request logging enabled
- [ ] CORS properly configured
```

---

## Common Vulnerabilities

### BOLA (Broken Object Level Authorization)
```typescript
// ❌ Vulnerable
const order = await getOrder(params.id)

// ✅ Fixed
const order = await getOrder(params.id)
if (order.userId !== session.userId) {
  throw new ForbiddenError()
}
```

### Mass Assignment
```typescript
// ❌ Vulnerable
await db.update(users).set(req.body).where(eq(users.id, id))

// ✅ Fixed - whitelist fields
const { name, email } = req.body
await db.update(users).set({ name, email }).where(eq(users.id, id))
```

### SQL Injection
```typescript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${id}`

// ✅ Fixed - parameterized
const user = await db.select().from(users).where(eq(users.id, id))
```

---

## Notes

- Test with different user roles
- Check both success and error paths
- Verify rate limits actually work
- Test authorization edge cases
- Log security-relevant events
