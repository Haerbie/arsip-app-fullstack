# Tech Stack Document

This document explains, in everyday language, the technology choices made for the Local Archive Web Application. It covers the tools used on the front end, back end, infrastructure, integrations, security, and performance, and ends with a summary of how everything works together to meet your goals.

## 1. Frontend Technologies

These are the building blocks for everything that users see and interact with in their web browser:

- **Next.js (App Router)**
  - Provides a clean, file-based way to organize pages and API routes.
  - Lets us server-render pages for faster loading and better search engine performance.
- **React**
  - Powers the dynamic parts of the user interface (forms, tables, dashboards).
  - Makes it easy to break the UI into reusable components.
- **Tailwind CSS**
  - A utility-first styling tool that speeds up design work.
  - Simplifies implementing responsive layouts and a Dark Mode theme via CSS variables.
- **shadcn/ui**
  - A set of pre-built, accessible UI components (data tables, forms, cards).
  - Ensures visual consistency and reduces manual design effort.
- **TypeScript**
  - Adds type safety to all frontend code, catching mistakes before they cause bugs.
  - Works hand-in-hand with React and Next.js for a smoother development experience.

These tools combine to create a fast, responsive, and easy-to-use interface for managing archive records, with minimal custom styling work and built-in theme support.

## 2. Backend Technologies

These tools power the server side of the application, handling data storage, business logic, and security checks:

- **Next.js API Routes**
  - Host server-side functions right alongside the frontend.
  - Handle all Create/Read/Update/Delete (CRUD) operations for archive data.
  - Include role checks at the API level to prevent unauthorized access.
- **Better Auth Library**
  - Provides user authentication (sign up, sign in) and session management.
  - Is customized to support three roles: `superadmin`, `operator`, and `user`.
  - Implements a “pending” state for new registrations, which only a superadmin can approve.
- **MySQL Database**
  - Stores all archive records in seven core tables (e.g., Arsip Unit, Berkas Arsip, Kategori, Sub Kategori, Kode Klasifikasi, Unit Pengolah, Manajemen Pengguna).
  - Chosen for its reliability and familiarity when working with structured relational data.
- **Drizzle ORM**
  - A TypeScript-friendly library that defines database schemas and relationships in code.
  - Ensures type safety across queries, reducing runtime errors and data mismatches.
  - Easily switches from the default PostgreSQL setup to MySQL by changing configuration and driver (`mysql2`).
- **Docker**
  - Runs the MySQL database in a containerized environment for consistent setup across all developers’ machines.

Together, these backend components handle user roles, data integrity, and the core workflows of archiving documents.

## 3. Infrastructure and Deployment

These choices ensure the application is reliable, easy to update, and can grow over time:

- **Git & GitHub**
  - Version control system for tracking code changes and collaborating with the team.
  - GitHub repositories provide code hosting, pull-request workflows, and issue tracking.
- **Continuous Integration / Continuous Deployment (CI/CD)**
  - Automated pipelines (for example, GitHub Actions) run tests and build the app on each code change.
  - Ensures that only tested, approved code is deployed to production.
- **Hosting Platform**
  - Services like Vercel (perfect for Next.js) or AWS amplify can host the frontend and API with minimal configuration.
  - Offers automatic SSL, global content delivery, and easy rollbacks.
- **Container Registry**
  - Stores Docker images for the MySQL database and any additional services.
  - Simplifies deployment in staging and production.

This setup lets us push updates confidently, knowing that code is tested, versioned, and deployed in a reproducible way.

## 4. Third-Party Integrations

External services that add key features without reinventing the wheel:

- **File Storage (e.g., AWS S3 or Local Volume)**
  - For uploading and serving scanned documents or large media files associated with archive entries.
  - Cloud storage like S3 offers durability and easy scaling.
- **Charting Library (e.g., Recharts)**
  - Renders interactive graphs in the statistics dashboard (e.g., number of archives per category).
  - Helps users visualize trends and key metrics at a glance.
- **Analytics (e.g., Google Analytics or Plausible)**
  - Tracks usage patterns, popular pages, and user behavior.
  - Supports data-driven decisions about feature improvements.

Each integration is chosen to enhance core archive functionality without adding complex internal code.

## 5. Security and Performance Considerations

We’ve built in several measures to keep data safe and ensure a smooth user experience:

- **Role-Based Access Control (RBAC)**
  - Both frontend components and API routes check user roles (`superadmin`, `operator`, `user`).
  - Prevents users from seeing or performing actions they are not allowed to.
- **Authentication & Session Protection**
  - Better Auth uses secure cookies and session tokens to keep users logged in safely.
  - New accounts remain in a “pending” state until approved by a superadmin.
- **Data Validation**
  - API endpoints validate input against expected schemas, preventing invalid or malicious data.
  - Drizzle ORM ensures correct data types and relationships before writing to the database.
- **Performance Optimizations**
  - Server-side rendering and static asset caching (via Next.js) speed up page loads.
  - Tailwind’s Just-In-Time (JIT) compiler generates only the CSS you need.
  - Lazy loading of components and code-splitting reduce initial bundle sizes.

These practices keep the application responsive, protect sensitive archive information, and maintain data integrity.

## 6. Conclusion and Overall Tech Stack Summary

Our Local Archive Web Application combines modern, proven technologies to deliver a secure, scalable, and user-friendly system:

- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui, TypeScript
- **Backend**: Next.js API routes, Better Auth, MySQL, Drizzle ORM, Docker
- **Infrastructure**: Git/GitHub, CI/CD (GitHub Actions), Vercel or AWS hosting, Docker containers
- **Third-Party**: AWS S3 (or similar) for file storage, Recharts for charts, Analytics for usage insights
- **Security & Performance**: RBAC, secure sessions, input validation, server-side rendering, CSS JIT, code-splitting

These choices align with the project’s goals of robust multi-role authentication, type-safe data handling, responsive UI with Dark Mode, and reliable deployment workflows. The stack is ready to grow as your archive system adds features like advanced search, audit logging, and reporting.