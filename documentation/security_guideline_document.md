# Security Guideline Document for Local Archive Web Application

This security guideline is tailored for the `codeguide-starter-fullstack` repository, adapted to build a secure Local Archive Web Application using Next.js (App Router), Drizzle ORM, MySQL, shadcn/ui, and Tailwind CSS. It enforces security by design and covers authentication, data protection, API security, infrastructure hardening, and more.

---

## 1. Security Objectives

- Embed security at every layer from design through deployment.  
- Ensure least privilege for all users, services, and components.  
- Protect archive data (PII and documents) both at rest and in transit.  
- Prevent common web attacks (injection, XSS, CSRF, file-upload abuse).  
- Maintain auditability and confidentiality of user and administrative actions.

---

## 2. Authentication & Access Control

### 2.1 Multi-Role Authentication
- Use the Better Auth library, customized for three roles: `superadmin`, `operator`, `user`.  
- Store user passwords hashed with a modern algorithm (Argon2 or bcrypt) and a unique per-user salt.  
- Enforce strong password policies: minimum length, complexity rules, and periodic rotation for admin users.

### 2.2 Session & Token Security
- Use HTTP-only, Secure, SameSite=Strict cookies for session tokens.  
- Generate unpredictable session identifiers and invalidate sessions on logout.  
- Implement absolute and idle session timeouts (e.g., 30 minutes idle, 8 hours absolute).  
- If using JWTs, validate signature, algorithm (avoid `none`), and expiration (`exp`) on every request.

### 2.3 Role-Based Access Control (RBAC)
- Define roles and permissions centrally in `lib/auth.ts`.  
- Enforce server-side role checks in Next.js API routes (e.g., via middleware) before any CRUD operation.  
- Restrict UI elements conditionally on user role, but rely on backend enforcement.  
- New user registrations default to `pending` status; only `superadmin` may approve.

### 2.4 Multi-Factor Authentication (MFA)
- Provide optional MFA (TOTP or SMS) for privileged roles (`superadmin`, `operator`).

---

## 3. Input Handling & Output Encoding

### 3.1 Parameterized Queries & ORM Safety
- Use Drizzle ORM’s prepared statements to prevent SQL injection against MySQL.  
- Never build SQL strings via concatenation.  

### 3.2 Server-Side Validation
- Validate all incoming JSON, form data, and query parameters in API routes.  
- Define Zod or Joi schemas for request payloads; reject or sanitize unexpected fields.

### 3.3 Cross-Site Scripting (XSS) Prevention
- Escape and sanitize any user-provided data before rendering in React components.  
- Use React’s built-in auto-escaping, and never set `dangerouslySetInnerHTML` with untrusted content.

### 3.4 Cross-Site Request Forgery (CSRF)
- Implement CSRF tokens (synchronizer token pattern) for all state-changing POST/PUT/DELETE requests.  
- Leverage Next.js middleware or libraries like `next-csrf` to generate and validate tokens.

### 3.5 Secure Redirects
- Maintain an allow-list of valid redirect targets.  
- Validate `redirectTo` query parameters against this allow-list to prevent open redirect attacks.

### 3.6 Secure File Uploads
- Restrict file types and maximum size for scanned documents (e.g., PDF/JPEG only, ≤ 10 MB).  
- Validate file content (magic bytes) and sanitize filenames to strip path characters.  
- Store uploads outside the webroot or in a protected bucket (e.g., AWS S3 with IAM roles).  
- Scan uploads for malware using a virus-scan service or library.

---

## 4. Data Protection & Privacy

### 4.1 Encryption In Transit and At Rest
- Enforce HTTPS (TLS 1.2+) for all web and API traffic; redirect HTTP to HTTPS.  
- Configure HSTS with `max-age=31536000; includeSubDomains; preload`.
- Encrypt sensitive fields (PII) in the database if required by regulation (e.g., AES-256).  

### 4.2 Secrets Management
- Do not hardcode credentials or API keys in source code.  
- Use environment variables and a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).  
- Restrict access to secrets at the OS and container level.

### 4.3 Protecting Database Connections
- Use encrypted connections (MySQL SSL/TLS).  
- Create a dedicated MySQL user with least privileges for the application.  
- Rotate database credentials periodically.

### 4.4 Logging & Audit Trail
- Record all administrative actions in an `AuditLog` table: user ID, action, target record, timestamp, IP address.  
- Sanitize log entries to avoid PII leakage.  
- Store logs in append-only mode and review them regularly for anomalies.

---

## 5. API & Service Security

### 5.1 Rate Limiting & Throttling
- Implement request rate limiting via Next.js middleware or a reverse proxy (e.g., Nginx, Cloudflare).  
- Apply stricter limits on authentication and file upload endpoints.

### 5.2 CORS Configuration
- Restrict cross-origin requests to known, trusted domains.  
- Avoid wildcard (`*`) origins; allow only the official frontend host.

### 5.3 API Design Best Practices
- Use proper HTTP methods: GET for reads, POST for creations, PUT/PATCH for updates, DELETE for removals.  
- Version API routes (e.g., `/api/v1/arsip-unit/`) to support safe evolution.  
- Return minimal necessary data; never expose sensitive fields (password hashes, tokens).

---

## 6. Web Application Security Hygiene

### 6.1 Security Headers
- Configure in `next.config.js` or a reverse proxy:  
  - `Content-Security-Policy`: only allow scripts and styles from self; block inline scripts.  
  - `X-Frame-Options: DENY` (prevent clickjacking).  
  - `X-Content-Type-Options: nosniff`.  
  - `Referrer-Policy: strict-origin-when-cross-origin`.

### 6.2 Secure Cookies
- Set `HttpOnly` and `Secure` flags on session cookies.  
- Use `SameSite=Strict` to prevent CSRF via cross-site contexts.

### 6.3 Client-Side Storage
- Avoid storing tokens or PII in `localStorage` or `sessionStorage`.  
- Keep authentication state within HTTP-only cookies.

---

## 7. Infrastructure & Configuration Management

### 7.1 Docker & Server Hardening
- Run containers as non-root users.  
- Limit exposed ports to only those required (e.g., 443, 80 for HTTP redirect).  
- Disable or remove unused services in the container images.

### 7.2 Environment Separation
- Maintain separate environments for Development, Staging, and Production.  
- Disable debug modes and verbose error messages in production.  
- Use environment-specific configuration files with secure defaults.

### 7.3 Dependency Management
- Use lockfiles (`package-lock.json`) to ensure deterministic installs.  
- Regularly run SCA scans (e.g., `npm audit`, Dependabot) to detect and remediate vulnerabilities.  
- Remove unused dependencies to minimize attack surface.

### 7.4 Software Updates
- Keep Next.js, Node.js, Drizzle ORM, and all dependencies up to date with security patches.  
- Subscribe to CVE feeds for critical components (e.g., MySQL, Docker base images).

---

## 8. Monitoring, Incident Response, and Compliance

- Implement centralized log aggregation and alerting for security events.  
- Define an incident response plan for data breaches or suspicious activity.  
- Ensure compliance with applicable data-privacy regulations (GDPR, CCPA), including user data deletion upon request.

---

## 9. Continuous Security Improvement

- Integrate security testing into CI/CD:
  - Static Application Security Testing (SAST) for code analysis.  
  - Dynamic Application Security Testing (DAST) against deployed endpoints.  
  - Dependency checks and container image scans.
- Conduct periodic security reviews and penetration tests.

---

By adhering to these guidelines—embedding security from design through deployment—you will build a robust, trustworthy Local Archive Web Application that protects your users and their data against evolving threats.