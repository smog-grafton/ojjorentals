Excellent. Now we connect **real UI pages → real Laravel APIs**, exactly how you’ll code it inside your **Materialize Next.js Admin template**.

I’ll show you:

* API service layer
* Auth flow
* Real pages (Dashboard, Tenants, Invoices, Payments)
* Patterns you can repeat everywhere

Everything here works with **static export**.

---

# 1️⃣ API SERVICE LAYER (ONE TIME SETUP)

### `src/services/api.ts`

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
```

📌 `.env.local`

```
NEXT_PUBLIC_API_URL=https://api.vinkyaba.com
```

---

# 2️⃣ AUTH FLOW (LOGIN PAGE)

### `src/pages/login.tsx`

```tsx
import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const submit = async () => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    router.push("/dashboard");
  };

  return (
    <div className="login-wrapper">
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
}
```

---

# 3️⃣ AUTH GUARD (PROTECT PAGES)

### `src/hooks/useAuth.ts`

```ts
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);
}
```

Use in pages:

```ts
useAuth();
```

---

# 4️⃣ DASHBOARD PAGE (SUMMARY CARDS)

### `src/pages/dashboard/index.tsx`

```tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
  useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard/summary").then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div className="grid">
      <Card title="Expected Rent" value={data.expected_rent} />
      <Card title="Collected" value={data.collected} />
      <Card title="Outstanding" value={data.outstanding} />
      <Card title="Overdue Tenants" value={data.overdue_count} />
    </div>
  );
}
```

---

# 5️⃣ TENANTS LIST PAGE

### `src/pages/tenants/index.tsx`

```tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

export default function Tenants() {
  useAuth();
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get("/tenants").then(res => setTenants(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((t: any) => (
          <tr key={t.id}>
            <td>{t.full_name}</td>
            <td>{t.phone}</td>
            <td>{t.unit?.unit_number}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

# 6️⃣ CREATE TENANT (FORM → API)

### `src/pages/tenants/create.tsx`

```tsx
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

export default function CreateTenant() {
  useAuth();
  const router = useRouter();
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get("/units").then(res => setUnits(res.data));
  }, []);

  const submit = async () => {
    await api.post("/tenants", form);
    router.push("/tenants");
  };

  return (
    <>
      <input placeholder="Full Name" onChange={e => setForm({...form, full_name: e.target.value})} />
      <input placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} />

      <select onChange={e => setForm({...form, unit_id: e.target.value})}>
        <option>Select Unit</option>
        {units.map((u: any) => (
          <option key={u.id} value={u.id}>{u.unit_number}</option>
        ))}
      </select>

      <button onClick={submit}>Save Tenant</button>
    </>
  );
}
```

---

# 7️⃣ INVOICES LIST + PDF DOWNLOAD

### `src/pages/invoices/index.tsx`

```tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

export default function Invoices() {
  useAuth();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get("/invoices").then(res => setInvoices(res.data));
  }, []);

  return (
    <table>
      <tbody>
        {invoices.map((inv: any) => (
          <tr key={inv.id}>
            <td>{inv.invoice_number}</td>
            <td>{inv.tenant.full_name}</td>
            <td>{inv.total_amount}</td>
            <td>
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/invoices/${inv.id}/pdf`} target="_blank">
                PDF
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

# 8️⃣ RECORD PAYMENT (CRITICAL FLOW)

### `src/pages/payments/create.tsx`

```tsx
import { useState, useEffect } from "react";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

export default function Payment() {
  useAuth();
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api.get("/invoices").then(res => setInvoices(res.data));
  }, []);

  const submit = async () => {
    await api.post("/payments", form);
    alert("Payment recorded");
  };

  return (
    <>
      <select onChange={e => setForm({...form, invoice_id: e.target.value})}>
        <option>Select Invoice</option>
        {invoices.map((i: any) => (
          <option key={i.id} value={i.id}>
            {i.invoice_number} - {i.total_amount}
          </option>
        ))}
      </select>

      <input type="number" placeholder="Amount" onChange={e => setForm({...form, amount: e.target.value})} />

      <select onChange={e => setForm({...form, payment_method: e.target.value})}>
        <option value="cash">Cash</option>
        <option value="mobile_money">Mobile Money</option>
        <option value="bank">Bank</option>
      </select>

      <button onClick={submit}>Save Payment</button>
    </>
  );
}
```

---

# 9️⃣ OVERDUE PAGE (HIGH-VALUE)

### `src/pages/overdue/index.tsx`

```tsx
import { useEffect, useState } from "react";
import api from "@/services/api";
import useAuth from "@/hooks/useAuth";

export default function Overdue() {
  useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/overdue").then(res => setItems(res.data));
  }, []);

  return (
    <table>
      {items.map((o: any) => (
        <tr key={o.id}>
          <td>{o.tenant.full_name}</td>
          <td>{o.unit.unit_number}</td>
          <td>{o.total_amount}</td>
        </tr>
      ))}
    </table>
  );
}
```

---

# 🔁 PATTERN YOU WILL REPEAT

1. Page loads
2. `useAuth()`
3. `api.get()` or `api.post()`
4. Render Materialize components
5. PDF opens from Laravel

---

# 🚀 WHAT YOU NOW HAVE

✔ Fully wired frontend → backend
✔ Static-export friendly
✔ Secure token-based auth
✔ Repeatable pattern for every feature

---

## NEXT STEP (FINAL LAYER)

👉 **PDF invoice & receipt templates (Uganda-friendly)**
(letterheads, legal wording, currency UGX)

Say **“Next: PDF templates”** and we finish this system properly 👊
