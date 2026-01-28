---
description: Check HTTP security headers against OWASP recommendations. Validates CSP, HSTS, and other protective headers.
---

# Security Headers Check

Audit HTTP security headers for web applications.

## Usage

```bash
/security:headers                    # Check local dev server
/security:headers https://myapp.com  # Check production URL
/security:headers --strict           # Enforce strict standards
```

## When to Run

| Trigger | Priority |
|---------|----------|
| Before deployment | Required |
| After config changes | Required |
| Monthly audit | Recommended |

---

## Headers Checked

### Critical Headers

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| `Content-Security-Policy` | Prevent XSS, injection | Strict policy |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` or `SAMEORIGIN` |

### Important Headers

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| `X-XSS-Protection` | XSS filter (legacy) | `1; mode=block` |
| `Referrer-Policy` | Control referer info | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Limit browser features | Restrict unused APIs |

### Cookie Security

| Attribute | Purpose | Required |
|-----------|---------|----------|
| `Secure` | HTTPS only | Yes (production) |
| `HttpOnly` | No JS access | Yes (session cookies) |
| `SameSite` | CSRF protection | `Strict` or `Lax` |

---

## Check Process

### Step 1: Fetch Headers

```bash
# Check production URL
curl -I -s https://myapp.com | grep -i "^[a-z-]*:"

# Check localhost
curl -I -s http://localhost:3000 | grep -i "^[a-z-]*:"
```

### Step 2: Analyze Each Header

For each security header:
1. Check if present
2. Validate value against recommendations
3. Flag missing or weak configurations

### Step 3: Test CSP

```bash
# Check Content-Security-Policy
curl -s -I https://myapp.com | grep -i "content-security-policy"
```

Validate CSP includes:
- `default-src 'self'`
- `script-src` without `'unsafe-inline'` (if possible)
- `style-src` without `'unsafe-inline'` (if possible)
- `img-src` with allowed domains
- `connect-src` for API endpoints
- `frame-ancestors` to prevent framing

### Step 4: Check CORS

```bash
# Test CORS configuration
curl -s -I -H "Origin: https://evil.com" https://myapp.com/api/test \
  | grep -i "access-control"
```

Validate:
- `Access-Control-Allow-Origin` is not `*` (for authenticated APIs)
- Credentials allowed only for trusted origins
- Methods and headers are restricted

---

## Output Format

```markdown
## Security Headers Report

**URL**: https://myapp.com
**Time**: {timestamp}

### Summary

| Category | Score | Status |
|----------|-------|--------|
| Overall | B+ | ⚠️ Good |
| CSP | A | ✅ Excellent |
| HSTS | A | ✅ Excellent |
| Cookies | C | ⚠️ Needs Work |

### Header Analysis

#### ✅ Content-Security-Policy
**Status**: Present and strong
**Value**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.example.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
```

**Notes**:
- ⚠️ `'unsafe-inline'` in script-src (consider using nonces)
- ✅ `frame-ancestors 'none'` prevents clickjacking

---

#### ✅ Strict-Transport-Security
**Status**: Present
**Value**: `max-age=31536000; includeSubDomains; preload`

**Score**: A (Perfect)

---

#### ❌ X-Frame-Options
**Status**: Missing
**Risk**: HIGH - Clickjacking vulnerability

**Fix** (Next.js):
```javascript
// next.config.js
headers: async () => [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' }
    ]
  }
]
```

---

#### ⚠️ Cookies
**Issues Found**:

| Cookie | Issue |
|--------|-------|
| `session` | Missing `SameSite` attribute |
| `auth_token` | Missing `Secure` flag |

**Fix**:
```javascript
res.cookie('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 86400000
})
```

---

### CORS Configuration

| Header | Value | Status |
|--------|-------|--------|
| Access-Control-Allow-Origin | https://myapp.com | ✅ Specific |
| Access-Control-Allow-Credentials | true | ✅ OK |
| Access-Control-Allow-Methods | GET, POST, PUT, DELETE | ⚠️ Broad |

---

### Recommendations

1. **Add X-Frame-Options header** (prevents clickjacking)
2. **Add SameSite to cookies** (prevents CSRF)
3. **Remove 'unsafe-inline' from CSP** (use nonces instead)
4. **Consider Permissions-Policy** (disable unused browser features)

### Implementation (Next.js)

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```
```

---

## Framework-Specific Fixes

### Next.js

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" }
        ]
      }
    ]
  }
}
```

### Express

```javascript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}))
```

### Vercel (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

---

## Online Tools

For additional verification:
- [securityheaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

## Notes

- Headers only work over HTTPS (except localhost)
- CSP can break functionality - test thoroughly
- Use Report-Only mode first for CSP
- Different pages may need different CSP rules
