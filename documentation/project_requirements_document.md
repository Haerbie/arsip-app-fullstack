# Project Requirements Document (PRD)

## 1. Project Overview

This project is a Local Archive Management Web Application designed to let organizations store, organize, and track physical or digital archive records in a secure, role-controlled environment. Instead of scattered spreadsheets or paper ledgers, users will have a centralized dashboard that shows key metrics and provides rich, form-based interfaces to manage archival units, classification codes, categories, and more.

We’re building this system to streamline how archives are created, approved, and maintained. Key objectives include supporting three user roles (superadmin, operator, user) with an explicit approval workflow, delivering real-time archive statistics, ensuring data integrity through type-safe database interactions, and offering a consistent, themeable UI with light/dark mode. Success means users can reliably perform CRUD (Create, Read, Update, Delete) operations on seven core data tables, view up-to-date metrics, and trust that only authorized actions occur.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1):**
- Email/password sign-up and sign-in with pending-state approval by superadmin
- Three roles with role-based access control: superadmin, operator, and user
- A protected statistics dashboard showing real-time counts from MySQL
- Collapsible sidebar navigation to seven management sections:
  - Arsip Unit
  - Berkas Arsip
  - Kategori
  - Sub Kategori
  - Kode Klasifikasi
  - Unit Pengolah
  - Manajemen Pengguna (user verification)
- CRUD interfaces for each of the seven tables using `shadcn/ui` components and Tailwind CSS
- Dark mode toggle with theming via CSS variables
- API routes in Next.js with server-side role checks
- MySQL database accessed via Drizzle ORM, running in Docker

**Out-of-Scope (Version 1):**
- Advanced search and filtering beyond basic table controls
- File upload and external storage (e.g., S3) for scanned documents
- Audit logging or detailed change history tables
- Data export (CSV/PDF) and custom reporting
- Mobile-only or offline support

## 3. User Flow

A new user visits the sign-up page, completes the registration form, and is marked as “pending.” They cannot access the dashboard until a superadmin logs in, visits the “Manajemen Pengguna” section, and approves their account. Once approved, the user receives a notification and can sign in normally.

After signing in, the user lands on the statistics dashboard, which displays live counts of archive units, files, and categories. A collapsible left sidebar lists links to each management section. The user clicks “Berkas Arsip” to view a table of archive bundles, uses the “New” button to open a form, and fills in required fields. All form submissions call secure API routes that verify the user’s role before saving to MySQL via Drizzle.

## 4. Core Features

- **Multi-Role Authentication & Approval**: Better Auth library customized to handle superadmin, operator, user roles and a pending-approval workflow.
- **Protected Statistics Dashboard**: Real-time metrics fetched from MySQL and displayed on a secure Next.js page.
- **Sidebar Navigation**: Collapsible, role-aware links to seven management areas.
- **CRUD Interfaces for Seven Tables**: Create, read, update, delete operations on:
  - Arsip Unit
  - Berkas Arsip
  - Kategori
  - Sub Kategori
  - Kode Klasifikasi
  - Unit Pengolah
  - Manajemen Pengguna
- **Role-Checked API Routes**: Next.js API endpoints that enforce server-side access control based on session roles.
- **Type-Safe Database Layer**: Drizzle ORM schemas and relationships, switched to MySQL, with full TypeScript safety.
- **Theming & Dark Mode**: Tailwind CSS + CSS variables to support light and dark themes with a UI toggle.
- **Containerized Database**: Dockerized MySQL setup for consistent local and test environments.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router) with React components, `shadcn/ui` library for tables and forms, Tailwind CSS for styling and theming.
- **Backend**: Next.js API routes, Better Auth for authentication and session management.
- **Database**: MySQL (via Docker), Drizzle ORM for schema definitions and queries.
- **Language**: TypeScript end-to-end for type safety.
- **Development**: Docker Compose for local services, VS Code with possible plugins like Windsurf or Cursor for AI-assisted coding.
- **Optional AI Models**: None in Version 1 (no GPT integration required).

## 6. Non-Functional Requirements

- **Performance**: Page loads under 2 seconds; simple API queries respond within 200 ms.
- **Security**: HTTPS for all traffic; server-side role checks on every API; input validation and SQL injection protection by Drizzle.
- **Usability**: Responsive design across desktop and tablet; accessible form labels and keyboard navigation; clear error messages.
- **Scalability**: Support up to 10,000 archive records without performance degradation; Drizzle connection pooling.
- **Maintainability**: Modular folder structure; consistent coding standards; TypeScript types for all database models and API payloads.

## 7. Constraints & Assumptions

- The development environment will run Docker for MySQL; no managed DB service in Version 1.
- Drizzle ORM fully supports needed relationships on MySQL.
- Better Auth handles custom roles and pending-approval logic without heavy rewrites.
- Browser support for modern evergreen browsers (Chrome, Firefox, Edge, Safari).
- No offline or mobile-first requirements beyond responsive design.

## 8. Known Issues & Potential Pitfalls

- **MySQL Migration**: Moving from the starter’s default PostgreSQL to MySQL requires updating Drizzle configuration and ensuring feature parity.
  - *Mitigation*: Write simple migration scripts and test schema with seed data.
- **Role Misconfiguration**: Inconsistent role checks between UI and API could expose endpoints.
  - *Mitigation*: Centralize role logic in middleware and reuse it in all routes.
- **Complex Relationships**: Defining many-to-many or one-to-many associations (e.g., Kode Klasifikasi ↔ Arsip Unit) may introduce query complexity.
  - *Mitigation*: Start with clear Drizzle schema definitions and write unit tests for each relationship.
- **Dark Mode Theming**: Custom CSS variable naming may clash if not planned carefully.
  - *Mitigation*: Define a consistent design token system (`--color-bg`, `--color-text`) before building components.

---

This PRD is intended as the single source of truth for all upcoming technical documents: Tech Stack overview, Frontend Guidelines, Backend Architecture, API specifications, and File Structure Plans. All details needed to remove ambiguity have been specified above.