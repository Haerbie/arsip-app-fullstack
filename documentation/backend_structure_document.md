# Backend Structure Document

## Backend Architecture

This project uses a modular, layered approach to organize server-side code. At its core is the Next.js framework, which provides API routes for backend logic alongside the React-based frontend. Key design patterns and frameworks include:

- Next.js API Routes for handling HTTP requests in a file-based routing structure
- Drizzle ORM for a type-safe, code-first approach to database interactions
- Better Auth library for centralized authentication and authorization
- Docker for containerized local development and consistent environments

How the architecture supports project goals:

- **Scalability**: Serverless deployment (e.g., Vercel) or container orchestration (e.g., AWS ECS/Fargate) allows automatic scaling of API endpoints. The database can be scaled vertically or horizontally (read replicas).
- **Maintainability**: Clear separation of concerns—API handlers (`app/api`), business logic (`lib`), data layer (`db/schema` and Drizzle)—makes it easy to locate and update functionality.
- **Performance**: API routes are lightweight serverless functions. Drizzle ORM generates optimized SQL queries. Static assets and UI components are served via a CDN.

## Database Management

The application relies on a relational database to store structured archival data. Key aspects:

- Database System: **MySQL** (dev environment via Docker, production via AWS RDS or equivalent)
- ORM: **Drizzle ORM**, providing type-safe schema definitions and query builders in TypeScript
- Data Organization:
  - Normalized tables for each core entity (Users, Archive Units, Archive Bundles, Categories, Subcategories, Classification Codes, Processing Units)
  - Audit logging table to track who performed which actions on records
- Data Access:
  - All reads and writes go through Drizzle to prevent SQL injection and ensure consistent data handling
  - Migrations or schema sync scripts manage schema updates across environments

## Database Schema

### Human-Readable Overview

1. **users**
   - Unique ID, email, password hash
   - Role (superadmin, operator, user)
   - Status (pending, active, suspended)
   - Timestamps for creation and updates
2. **audit_logs**
   - Unique ID, referencing user ID
   - Action description, target entity type and ID
   - Timestamp of the action
3. **berkas_arsip** (Archive Bundles)
   - Unique ID, title, description, date
   - Timestamps
4. **arsip_unit** (Archive Units)
   - Unique ID, name
   - Foreign keys: berkas_arsip, kode_klasifikasi, unit_pengolah
   - Timestamps
5. **kategori** (Categories)
   - Unique ID, name, description
   - Timestamps
6. **sub_kategori** (Subcategories)
   - Unique ID, name, foreign key to kategori
   - Description, timestamps
7. **kode_klasifikasi** (Classification Codes)
   - Unique ID, code, title, description
   - Timestamps
8. **unit_pengolah** (Processing Units)
   - Unique ID, name, department
   - Timestamps
9. **files** (Optional: file metadata)
   - Unique ID, related arsip_unit ID
   - File URL, original filename, upload timestamp, uploaded by

### SQL Schema (MySQL Syntax)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin','operator','user') NOT NULL DEFAULT 'user',
  status ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE berkas_arsip (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  archive_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sub_kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  kategori_id INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id)
);

CREATE TABLE kode_klasifikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE unit_pengolah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE arsip_unit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  berkas_arsip_id INT NOT NULL,
  kode_klasifikasi_id INT NOT NULL,
  unit_pengolah_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (berkas_arsip_id) REFERENCES berkas_arsip(id),
  FOREIGN KEY (kode_klasifikasi_id) REFERENCES kode_klasifikasi(id),
  FOREIGN KEY (unit_pengolah_id) REFERENCES unit_pengolah(id)
);

-- Optional file metadata table
CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  arsip_unit_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  FOREIGN KEY (arsip_unit_id) REFERENCES arsip_unit(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```  

## API Design and Endpoints

APIs follow a RESTful style, implemented via Next.js API routes. Role-based middleware checks user permissions before executing handlers.

Key endpoints:

- **Authentication**
  - `POST /api/auth/sign-up` • Register new user (status defaults to ‘pending’)
  - `POST /api/auth/sign-in` • Login and issue session token
  - `POST /api/auth/sign-out` • Invalidate session
- **User Management**
  - `GET /api/users` • List users (superadmin only)
  - `PATCH /api/users/:id/approve` • Approve pending user (superadmin)
  - `PATCH /api/users/:id/role` • Change user role (superadmin)
- **Archive Bundles** (`berkas_arsip`)
  - `GET /api/berkas-arsip` • List bundles
  - `GET /api/berkas-arsip/:id` • Bundle details
  - `POST /api/berkas-arsip` • Create bundle
  - `PUT /api/berkas-arsip/:id` • Update bundle
  - `DELETE /api/berkas-arsip/:id` • Delete bundle
- **Archive Units** (`arsip_unit`)
  - Similar CRUD endpoints, validating existence of related classification and unit_pengolah
- **Categories & Subcategories**
  - CRUD routes under `/api/kategori` and `/api/sub-kategori`
- **Classification Codes**
  - CRUD routes under `/api/kode-klasifikasi`
- **Processing Units**
  - CRUD routes under `/api/unit-pengolah`
- **File Uploads** (if implemented)
  - `POST /api/files` • Upload metadata and store file in S3
  - `GET /api/files/:id` • Retrieve file URL or stream

Each route uses middleware to:

- Verify authentication token
- Check user role against allowed actions
- Log actions in `audit_logs`

## Hosting Solutions

- **Frontend & API**: Deployed on Vercel as serverless functions for effortless scaling and built-in global CDN
- **Database**: Hosted on AWS RDS (MySQL) with automatic backups and read replicas as needed
- **File Storage**: AWS S3 for storing scanned documents or attachments

Benefits:

- **Reliability**: Managed services with SLA guarantees
- **Scalability**: Serverless and managed database scaling
- **Cost-effectiveness**: Pay-as-you-go pricing models

## Infrastructure Components

- **Load Balancer**: Handled by Vercel’s edge network or AWS Application Load Balancer for containers
- **Content Delivery Network (CDN)**: Vercel’s CDN for static assets, CloudFront in front of S3
- **Caching**:
  - HTTP-level caching via Cache-Control headers
  - (Optional) In-memory cache (Redis) for heavy-read endpoints
- **Containerization**: Docker Compose for local dev environment (Next.js, MySQL)
- **CI/CD**: GitHub Actions to run tests, lint, build, and deploy on push

These pieces work together to deliver fast responses, distributed asset delivery, and a reproducible developer environment.

## Security Measures

- **Authentication & Authorization**: Better Auth library issues JWT-based sessions with embedded user role and status
- **Data Encryption**:
  - In transit: TLS/HTTPS for all endpoints and database connections
  - At rest: AWS RDS and S3 encryption features enabled
- **Input Validation**: All incoming payloads validated against TypeScript types and Drizzle validators
- **Role Checks**: Enforced both in API middleware and frontend UI to prevent unauthorized actions
- **Audit Logging**: Every create, update, delete action recorded in `audit_logs` for compliance
- **Environment Variables**: Secrets (DB credentials, JWT keys) stored securely via Vercel/AWS Secrets Manager

## Monitoring and Maintenance

- **Error Tracking**: Sentry for capturing server-side exceptions
- **Performance Monitoring**: Vercel Analytics or Prometheus/Grafana stack for custom container setups
- **Logs**: Structured logs via a logger (e.g., Winston) sent to a log management service (e.g., Logflare)
- **Database Health**: Automated alerts on slow queries or replication lag via AWS CloudWatch
- **Maintenance Strategy**:
  - Regular dependency updates via automated pull requests (Dependabot)
  - Scheduled database backups and test restores
  - Load testing before major releases to ensure continued performance

## Conclusion and Overall Backend Summary

This backend setup delivers a reliable, scalable, and maintainable foundation for your Local Archive Web Application. By combining Next.js API routes, Drizzle ORM, and Better Auth, we ensure type safety, modularity, and robust security. Managed cloud services (Vercel, AWS RDS, S3) provide high availability and pay-as-you-go pricing. Infrastructure components like CDN, caching, and CI/CD pipelines guarantee fast responses and a smooth developer experience.

Unique aspects:

- **Type-Safe End-to-End**: Drizzle ORM ensures consistency from database schema to frontend types
- **Role-Based Workflows**: Built-in approval flow for new users keeps archive access under tight control
- **Audit Trail**: Comprehensive logging of all data changes supports accountability and compliance

With this clear structure, anyone on your team can understand, maintain, and extend the backend, focusing on delivering value through archive management features rather than reinventing the foundation.