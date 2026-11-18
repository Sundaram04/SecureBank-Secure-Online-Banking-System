# SecureBank — Local Setup and Execution Guide

This document provides complete instructions for executing and evaluating **SecureBank** entirely on your local machine.

---

## 1. System Requirements

- **Operating System:** Windows 10/11 (or macOS / Linux)
- **Java Development Kit (JDK):** JDK 21+ or JDK 26
- **Node.js:** v20.x or v24.x (with npm v10+)
- **Build Tool:** Apache Maven 3.9+
- **Database:** PostgreSQL 15, 16, 17, or 18 running locally on port `5432`

---

## 2. Environment Verification

Open PowerShell or your terminal and verify the installed tools:

```powershell
# 1. Verify Java
java -version

# 2. Verify Maven
mvn -version

# 3. Verify Node.js and npm
node -v
npm -v

# 4. Verify PostgreSQL service status
Get-Service *postgres*
```

---

## 3. Database Configuration & Initialization

### Option A: Using the Automated Setup Script
Run the provided PowerShell script:
```powershell
cd e:\SecureBank
.\scripts\setup-db.ps1
```
The script will locate your PostgreSQL binary (`psql.exe`), prompt for your `postgres` superuser password, test the connection, and create the database `securebank_db`.

### Option B: Manual Creation via `psql`
If you prefer running SQL directly:
```powershell
# In PowerShell:
$env:PGPASSWORD = "your_postgres_password"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE securebank_db ENCODING 'UTF8';"
```

### Database Migrations
You do not need to run manual table creation scripts!  
When the Spring Boot backend starts, **Flyway** automatically runs:
1. `V1__init_schema.sql` (Creates all 15 tables, indexes, checks, and foreign keys)
2. `V2__seed_data.sql` (Inserts demonstration accounts, balances, beneficiaries, and audit records)

---

## 4. Application Configuration

Configuration is located in `backend/src/main/resources/application.yml` and can be overridden via environment variables or `.env`:

| Parameter | Environment Variable | Default Value | Description |
|---|---|---|---|
| Database URL | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/securebank_db` | JDBC connection string |
| Database Username | `SPRING_DATASOURCE_USERNAME` | `postgres` | PostgreSQL username |
| Database Password | `SPRING_DATASOURCE_PASSWORD` | `postgres` | PostgreSQL password |
| AES Encryption Key | `SECUREBANK_AES_SECRET_KEY` | 64-char Hex String | 256-bit key for encrypting TOTP secrets |
| Allowed CORS Origins | `SECUREBANK_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | Allowed frontend origins |

---

## 5. Starting the Application

### Option A: Using the One-Click Startup Script
```powershell
cd e:\SecureBank
.\scripts\start-all.ps1
```
This script launches the Spring Boot backend in one PowerShell terminal and the Vite React frontend in another.

### Option B: Starting Components Individually

**Terminal 1 — Spring Boot Backend:**
```powershell
cd e:\SecureBank\backend
$env:SPRING_DATASOURCE_PASSWORD = "your_postgres_password"
mvn spring-boot:run
```
Expected output:
```
Started SecureBankApplication in X.XXX seconds
```
Backend is now listening on **`http://localhost:8080`**.

**Terminal 2 — React Frontend:**
```powershell
cd e:\SecureBank\frontend
npm run dev
```
Expected output:
```
  VITE v6.4.6  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Frontend is now accessible at **`http://localhost:5173`**.

---

## 6. Accessing the Application & Test Walkthrough

1. Open your browser and navigate to: **`http://localhost:5173`**
2. On the login page, you can use the **Local Demo Fast-Fill** buttons or enter:
   - **Customer A:** `customera@securebank.com` / `CustomerA@123`
   - **Customer B:** `customerb@securebank.com` / `CustomerB@123`
   - **Administrator:** `admin@securebank.com` / `AdminPassword@123`
3. Perform a simulated transfer from Customer A to Customer B:
   - Go to **Transfer Money**.
   - Select Bob (`SB-1002-SAVINGS`).
   - Transfer ₹2,000.
   - Inspect the transaction receipt and balance reduction (₹10,000 → ₹8,000).
   - Log out, sign in as Customer B, and verify the balance increase (₹5,000 → ₹7,000).
4. Inspect the **Security Demo Playground** (`http://localhost:5173/vulnerability-demo`) to test SQLi and XSS defenses interactively.
5. Log in as **Admin** to review the immutable audit logs and rule-based security events triggered by system actions.

---

## 7. Troubleshooting Guide

### Issue 1: PostgreSQL Authentication Failure
**Symptom:** `FATAL: password authentication failed for user "postgres"`  
**Fix:** Pass your actual PostgreSQL password before running:
```powershell
$env:SPRING_DATASOURCE_PASSWORD = "YourRealPassword"
cd backend
mvn spring-boot:run
```

### Issue 2: Port 8080 or Port 5432 Already in Use
**Symptom:** `Port 8080 was already in use.`  
**Fix:** Check and terminate conflicting processes:
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### Issue 3: Rollup Native File Blocked on Windows
**Symptom:** `Error: An Application Control policy has blocked this file ... rollup.win32-x64-msvc.node`  
**Fix:** SecureBank has already configured `@rollup/wasm-node` fallback via `postinstall` script in `frontend/package.json`. No native `.node` binaries are required.

### Issue 4: Resetting the Database
To reset the simulation to fresh seed data:
```powershell
# Drop and recreate database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS securebank_db; CREATE DATABASE securebank_db ENCODING 'UTF8';"
# Restart backend (Flyway will automatically rebuild schema and seed data)
```
