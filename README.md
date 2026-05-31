# HAQMS: Hospital Appointment & Queue Management System

Welcome to **HAQMS (Hospital Appointment & Queue Management System)**. This is a production-ready, hardened full-stack web application designed for healthcare facility management.

The system features robust role-based access control, optimized database operations, and real-time queue management capabilities.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router, Tailwind CSS, Lucide icons, Context API)
- **Backend**: Node.js + Express
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Security**: JWT Authentication, RBAC, Data Sanitization
- **Performance**: Optimized Parallel Aggregation, DB Indexing, Paginated Lookups

---

## 🚀 Getting Started & Setup

Follow these steps to spin up the local development workspace:

### 1. Auto-Install Dependencies
Run the included workspace orchestrator bootstrap script to install packages in the root, frontend, and backend packages:
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Launch the Database
You need a running PostgreSQL server. If you have Docker installed, you can spin up the preconfigured container:
```bash
docker-compose up -d
```
Alternatively, configure your local PostgreSQL server and update the connection URL in `backend/.env`:
```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/haqms?schema=public"
```

### 3. Deploy Schema & Seed Mock Data
Apply Prisma schema migrations to the database and populate it with initial mock records (including administrative logins, medical histories, physician slots, and queue tokens):
```bash
npm run db:setup --prefix backend
```

### 4. Boot Dev Servers
Launch both the Next.js development client (port `3000`) and the Express API server (port `5000`) concurrently using:
```bash
npm run dev
```

---

## 🔑 Default Accounts
The database seed script populates the database with default accounts (All passwords are **`password123`**):

| Role | Email | Access Level |
|---|---|---|
| **Administrator** | `admin@haqms.com` | Full system reports, physician registries, and staff management |
| **Receptionist** | `reception1@haqms.com` | Patient registration, appointment scheduling, and queue check-in |
| **Doctor** | `doctor1@haqms.com` | Daily worklists, patient history access, and calling queue control |

---

## 🛡️ Production Features & Hardening

### 🔍 Security Architecture
- **Strict RBAC**: Enforced role-based access control across all API endpoints.
- **Secure Authentication**: JWT-based session management with secure storage practices.
- **Data Integrity**: Input validation and sanitization prevent malformed data entry.
- **Sanitized Error Handling**: Production error handler suppresses sensitive system details.

### ⚡ Performance & Concurrency
- **Parallel Aggregation**: Reporting modules utilize parallel processing to ensure high throughput.
- **Transactional Consistency**: Queue token generation uses database transactions and unique constraints to prevent race conditions.
- **Database Optimization**: Strategic indexing and SQL-level pagination ensure sub-millisecond response times even under high load.

### 🖥️ Frontend Stability
- **Null Safety**: UI components are hardened with optional chaining and fallback states to prevent runtime crashes.
- **Efficient State Management**: Optimized React hooks minimize unnecessary re-renders and memory overhead.
- **Live Sync**: Public monitors utilize efficient polling mechanisms with proper cleanup to prevent leaks.

---

&copy; {new Date().getFullYear()} Healthcare Management Solutions. Licensed for professional use.

