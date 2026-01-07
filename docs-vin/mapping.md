Perfect. Let’s do this **properly and clean**, production-grade but **not over-engineered**.

Below is a **clear Laravel ↔ Next.js API mapping** for **Vinkyaba**, designed for:

* Next.js **static export**
* Laravel **API-only backend**
* Simple auth
* Clean separation of concerns

---

# 1️⃣ High-Level Architecture

```
Next.js (Static)
   |
   |  HTTPS (JSON API)
   |
Laravel 12 API
   |
MySQL
```

📌 **Rule**
Next.js **never** talks directly to DB.
Everything goes through Laravel APIs.

---

# 2️⃣ Authentication Strategy (Static-Friendly)

### ✅ Recommended

**Token-based auth (Sanctum API tokens)**

Why?

* Works with static builds
* No cookies / CSRF drama
* Easy role control

### Auth Flow

1. User logs in
2. Laravel returns:

```json
{
  "token": "long_api_token_here",
  "user": {
    "id": 1,
    "role": "admin"
  }
}
```

3. Next.js stores token in:

* `localStorage` (acceptable for admin systems)
* or memory + refresh logic

---

# 3️⃣ API Naming Convention

```
/api/v1/
```

✔ Versioning future-proofs you.

---

# 4️⃣ AUTH ENDPOINTS

### Laravel Routes

```php
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Next.js Usage

```ts
POST /auth/login
```

---

# 5️⃣ DASHBOARD ENDPOINTS

### Laravel

```http
GET /api/v1/dashboard/summary
```

### Response

```json
{
  "expected_rent": 12000000,
  "collected": 8700000,
  "outstanding": 3300000,
  "overdue_count": 6
}
```

---

# 6️⃣ TENANTS

### Laravel

```http
GET    /api/v1/tenants
POST   /api/v1/tenants
GET    /api/v1/tenants/{id}
PUT    /api/v1/tenants/{id}
DELETE /api/v1/tenants/{id}
```

### Next.js Pages

```
/tenants
/tenants/[id]
```

---

# 7️⃣ UNITS / RENTALS

```http
GET    /api/v1/units
POST   /api/v1/units
PUT    /api/v1/units/{id}
```

Unit response should include:

```json
{
  "id": 4,
  "name": "Room B3",
  "rent": 450000,
  "tenant": {
    "id": 7,
    "name": "John Doe"
  }
}
```

---

# 8️⃣ INVOICES (CORE MONEY FLOW)

### Laravel

```http
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/{id}
POST   /api/v1/invoices/{id}/mark-paid
GET    /api/v1/invoices/{id}/pdf
```

### Auto-generation

```http
POST /api/v1/invoices/generate-monthly
```

🔒 Protect this with admin role.

---

# 9️⃣ PAYMENTS

```http
POST /api/v1/payments
GET  /api/v1/payments?tenant_id=1
```

Request:

```json
{
  "invoice_id": 12,
  "amount": 200000,
  "method": "mobile_money"
}
```

---

# 🔟 RECEIPTS

```http
GET /api/v1/receipts/{id}
GET /api/v1/receipts/{id}/pdf
```

Receipt created **automatically** on payment.

🚫 No update endpoint.

---

# 1️⃣1️⃣ OVERDUE & DEMAND NOTES

```http
GET  /api/v1/overdue
POST /api/v1/demand-notes/{invoice_id}
GET  /api/v1/demand-notes/{id}/pdf
```

---

# 1️⃣2️⃣ REMINDERS / NOTIFICATIONS

```http
GET  /api/v1/reminders
POST /api/v1/reminders/send
```

Response example:

```json
{
  "tenant": "Sarah K",
  "type": "overdue",
  "status": "sent"
}
```

---

# 1️⃣3️⃣ BILLS & EXPENSES

```http
GET  /api/v1/bills
POST /api/v1/bills
PUT  /api/v1/bills/{id}
```

---

# 1️⃣4️⃣ SETTINGS

```http
GET /api/v1/settings
PUT /api/v1/settings
```

Only Admin.

---

# 1️⃣5️⃣ Laravel Route Structure

```php
Route::prefix('v1')->group(function () {

  Route::post('/auth/login', [AuthController::class, 'login']);

  Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/summary', DashboardController::class);

    Route::apiResource('tenants', TenantController::class);
    Route::apiResource('units', UnitController::class);
    Route::apiResource('invoices', InvoiceController::class);

    Route::post('/payments', PaymentController::class);

    Route::get('/overdue', OverdueController::class);
  });
});
```

---

# 1️⃣6️⃣ Next.js API Service Wrapper (IMPORTANT)

```ts
// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

# 1️⃣7️⃣ Static Export Considerations

✔ All data fetched **client-side**
✔ Auth done after load
✔ No SSR required
✔ PDFs served directly from Laravel

---

# 1️⃣8️⃣ Security Must-Haves

* Rate limit auth endpoints
* Validate all inputs (Form Requests)
* Never trust frontend roles
* Audit logs for payments & receipts

---

## 🔥 Next Steps (Pick One)

1️⃣ Database schema (tables + relationships)
2️⃣ Laravel controllers & request validation
3️⃣ Next.js page → API wiring (real examples)
4️⃣ PDF invoice & receipt templates (Uganda-friendly)

Tell me which one you want next and we’ll lock it in 💪
