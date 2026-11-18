# SecureBank — Complete REST API Documentation

**Base URL:** `http://localhost:8080/api`  
**Protocol:** HTTP/1.1 (Local Simulation)  
**Security Headers:** Strict CSP, HSTS, X-Content-Type-Options, X-Frame-Options, CSRF Double-Submit  
**Content-Type:** `application/json`  

---

## 1. Authentication & Common Standards

### Global Response Envelope
All API endpoints return responses encapsulated in the standard `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "timestamp": "2026-11-18T02:30:00Z"
}
```

### Error Response Envelope
```json
{
  "success": false,
  "message": "Validation failed or resource not found.",
  "data": null,
  "timestamp": "2026-11-18T02:30:00Z"
}
```

### Authentication & CSRF Mechanism
- **Session Identification:** Managed via secure `JSESSIONID` cookie (`HttpOnly=true`, `SameSite=Lax`).
- **CSRF Token:** Delivered via `XSRF-TOKEN` cookie.
- **CSRF Header:** State-changing requests (POST, PUT, DELETE) MUST include:
  ```http
  X-XSRF-TOKEN: <value_from_XSRF-TOKEN_cookie>
  ```

---

## 2. Authentication API (`/api/auth`)

### 2.1 Register New Customer
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "robert_smith",
    "email": "robert@example.com",
    "password": "SecurePassword123!",
    "fullName": "Robert Smith",
    "phone": "+15551234567"
  }
  ```
- **Validation Rules:**
  - `email`: Valid email format.
  - `password`: Minimum 10 chars, uppercase, lowercase, number, special char.
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. Please login.",
    "data": {
      "userId": 4,
      "email": "robert@example.com",
      "fullName": "Robert Smith",
      "defaultAccountNumber": "1001-SAV-998811"
    }
  }
  ```

### 2.2 Customer & Admin Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public (Rate limited: 5 req/min)
- **Request Body:**
  ```json
  {
    "email": "customera@securebank.com",
    "password": "CustomerA@123"
  }
  ```
- **Success Response (200 OK — Standard Login):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "userId": 2,
      "email": "customera@securebank.com",
      "fullName": "Alice Johnson",
      "role": "ROLE_CUSTOMER",
      "mfaRequired": false
    }
  }
  ```
- **Success Response (200 OK — MFA Challenge):**
  ```json
  {
    "success": true,
    "message": "MFA verification required.",
    "data": {
      "mfaRequired": true,
      "tempToken": "mfa_temp_session_uuid_token"
    }
  }
  ```

### 2.3 Verify MFA Login Challenge
- **Endpoint:** `POST /api/auth/mfa/verify-login`
- **Access:** Public (With temporary challenge token)
- **Request Body:**
  ```json
  {
    "email": "admin@securebank.com",
    "totpCode": "492817"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "MFA verified. Session authenticated.",
    "data": {
      "userId": 1,
      "email": "admin@securebank.com",
      "role": "ROLE_ADMIN"
    }
  }
  ```

### 2.4 Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated
- **Success Response (200 OK):** Invalidates session and clears `JSESSIONID`.

### 2.5 Request Password Reset Token
- **Endpoint:** `POST /api/auth/password/forgot`
- **Access:** Public (Rate limited)
- **Request Body:**
  ```json
  { "email": "customer1@securebank.com" }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "If the email is registered, a password reset token has been generated.",
    "data": {
      "simulationResetToken": "a8f3b29c-71b5-412e-9d8a-6b8c9d0e1f2a"
    }
  }
  ```

### 2.6 Reset Password With Token
- **Endpoint:** `POST /api/auth/password/reset`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "token": "a8f3b29c-71b5-412e-9d8a-6b8c9d0e1f2a",
    "newPassword": "NewSecurePassword2026!"
  }
  ```

### 2.7 Get Current Authenticated User
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated

---

## 3. Account Management API (`/api/accounts`)

### 3.1 List Customer Accounts
- **Endpoint:** `GET /api/accounts`
- **Access:** Authenticated Customer
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "accountNumber": "1001-SAV-482910",
        "maskedAccountNumber": "••••-••••-2910",
        "accountType": "SAVINGS",
        "balance": 15000.00,
        "currency": "INR",
        "status": "ACTIVE",
        "createdAt": "2026-11-18T00:00:00Z"
      }
    ]
  }
  ```

### 3.2 Get Account Details
- **Endpoint:** `GET /api/accounts/{id}`
- **Access:** Authenticated Customer (Must own the account — IDOR Protected)

### 3.3 Get Account Statement & Ledger History
- **Endpoint:** `GET /api/accounts/{id}/statement`
- **Access:** Authenticated Customer (IDOR Protected)

---

## 4. Beneficiary Management API (`/api/beneficiaries`)

### 4.1 List Beneficiaries
- **Endpoint:** `GET /api/beneficiaries`
- **Access:** Authenticated Customer

### 4.2 Add New Beneficiary
- **Endpoint:** `POST /api/beneficiaries`
- **Access:** Authenticated Customer
- **Request Body:**
  ```json
  {
    "beneficiaryName": "Bob Smith",
    "beneficiaryAccountNumber": "1002-SAV-739201",
    "bankName": "SecureBank National",
    "nickname": "Bob Personal"
  }
  ```

### 4.3 Delete Beneficiary
- **Endpoint:** `DELETE /api/beneficiaries/{id}`
- **Access:** Authenticated Customer (Ownership verified)

---

## 5. Fund Transfer & Double-Entry Ledger API (`/api/transfers`)

### 5.1 Execute Secure Fund Transfer
- **Endpoint:** `POST /api/transfers`
- **Access:** Authenticated Customer
- **Concurrency Guard:** Deterministic dual-row `PESSIMISTIC_WRITE` locking
- **Ledger Invariance:** Enforces double-entry debit and credit bookkeeping
- **Request Body:**
  ```json
  {
    "sourceAccountId": 1,
    "destinationAccountNumber": "1002-SAV-739201",
    "amount": 2500.00,
    "description": "Consulting invoice payment",
    "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Transfer executed successfully.",
    "data": {
      "transactionReference": "TXN-20261118-8492018",
      "sourceAccountId": 1,
      "sourceMaskedNumber": "••••-••••-2910",
      "destinationMaskedNumber": "••••-••••-9201",
      "amount": 2500.00,
      "status": "COMPLETED",
      "executedAt": "2026-11-18T02:40:00Z"
    }
  }
  ```

### 5.2 Get Transfer Receipt by Reference
- **Endpoint:** `GET /api/transfers/{referenceId}`
- **Access:** Authenticated Customer (Must be party to transaction)

---

## 6. Transaction History API (`/api/transactions`)

### 6.1 Search and Filter Transactions
- **Endpoint:** `GET /api/transactions`
- **Access:** Authenticated Customer
- **Query Parameters:**
  - `page`: Page index (default: `0`)
  - `size`: Page size (default: `10`)
  - `reference`: Transaction reference search
  - `type`: `DEBIT` or `CREDIT`
  - `status`: `COMPLETED`, `PENDING`, `FAILED`

---

## 7. Customer Profile & Security API (`/api/profile` & `/api/security`)

### 7.1 Update Profile
- **Endpoint:** `PUT /api/profile`
- **Request Body:**
  ```json
  {
    "fullName": "Alice Johnson",
    "phone": "+15559876543"
  }
  ```

### 7.2 Change Password
- **Endpoint:** `POST /api/profile/password`
- **Request Body:**
  ```json
  {
    "currentPassword": "Password123!",
    "newPassword": "NewSecurePassword456!"
  }
  ```

### 7.3 Setup Multi-Factor Authentication (TOTP)
- **Endpoint:** `GET /api/security/mfa/setup`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "secretKey": "JBSWY3DPEHPK3PXP",
      "qrCodeDataUri": "data:image/png;base64,iVBORw0KGgo...",
      "backupCodes": ["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", ...]
    }
  }
  ```

### 7.4 Enable MFA (Confirm Code)
- **Endpoint:** `POST /api/security/mfa/enable`
- **Request Body:**
  ```json
  {
    "secretKey": "JBSWY3DPEHPK3PXP",
    "totpCode": "583921"
  }
  ```

### 7.5 Inspect Active Sessions
- **Endpoint:** `GET /api/security/sessions`

### 7.6 Terminate Session
- **Endpoint:** `DELETE /api/security/sessions/{id}`

---

## 8. Administrative API (`/api/admin`)

*All administrative endpoints strictly require `ROLE_ADMIN` authorization.*

### 8.1 Platform Security & Operational Statistics
- **Endpoint:** `GET /api/admin/stats`

### 8.2 Customer List & Account Inspection
- **Endpoint:** `GET /api/admin/customers`
- **Query Parameters:** `search`, `page`, `size`

### 8.3 Suspend or Reactivate Customer
- **Endpoint:** `POST /api/admin/customers/{id}/status`
- **Request Body:**
  ```json
  { "status": "SUSPENDED", "reason": "Suspicious login anomaly detected." }
  ```

### 8.4 Security Incident Triage
- **Endpoint:** `GET /api/admin/security-events`
- **Query Parameters:** `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`NEW`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`)

### 8.5 Update Security Event Status
- **Endpoint:** `PUT /api/admin/security-events/{id}/status`
- **Request Body:**
  ```json
  { "status": "RESOLVED", "resolutionNotes": "Verified legitimate customer device change." }
  ```

### 8.6 Immutable Audit Logs
- **Endpoint:** `GET /api/admin/audit-logs`

---

## 9. Interactive Vulnerability Demonstration API (`/api/demo`)

*Educational test harness endpoints used by the interactive Vulnerability Demo Lab.*

| Endpoint | Method | Attack Simulation | Secure Output Verification |
|---|---|---|---|
| `/api/demo/sqli` | POST | `' OR '1'='1` | Evaluates as literal string; 0 records exposed |
| `/api/demo/xss` | POST | `<script>alert('XSS')</script>` | Sanitized to safe HTML entities: `&lt;script&gt;...` |
| `/api/demo/csrf` | POST | Missing `X-XSRF-TOKEN` | Rejected with HTTP 403 Forbidden |
| `/api/demo/idor` | POST | Swapping target `accountId` | Denied with HTTP 403 and logged as security event |
| `/api/demo/rate-limit` | POST | High frequency requests | Blocked with HTTP 429 Too Many Requests |
