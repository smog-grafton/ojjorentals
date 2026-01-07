Perfect. We’ll do this **layer by layer, enterprise-clean but landlord-simple**.
Below is a **battle-tested database schema** tailored for **Ugandan rentals**, invoices, receipts, overdue logic, and future SMS.

I’ll give you:

* Tables
* Key fields
* Relationships
* Design decisions (why)

This schema fits **Laravel 12 + MySQL** cleanly.

---

# 🗄️ VINKYABA DATABASE SCHEMA (V1)

## 1️⃣ users

System users (admin, staff)

```sql
users
------
id (PK)
name
email (unique)
phone
password
role ENUM('admin','staff')
status ENUM('active','inactive')
created_at
updated_at
```

🔗 Relationships:

* hasMany → payments
* hasMany → receipts

---

## 2️⃣ properties (optional but future-proof)

Even if client has one property, **keep it**.

```sql
properties
-----------
id (PK)
name
location
created_at
updated_at
```

🔗 Relationships:

* hasMany → units
* hasMany → bills

---

## 3️⃣ units (rentals / rooms)

Each rentable space.

```sql
units
------
id (PK)
property_id (FK)
unit_number
monthly_rent
status ENUM('vacant','occupied')
created_at
updated_at
```

🔗 Relationships:

* belongsTo → property
* hasOne → tenant
* hasMany → invoices

---

## 4️⃣ tenants

The money source.

```sql
tenants
--------
id (PK)
unit_id (FK)
full_name
phone
national_id (nullable)
rent_start_date
status ENUM('active','moved_out','blacklisted')
created_at
updated_at
```

🔗 Relationships:

* belongsTo → unit
* hasMany → invoices
* hasMany → payments
* hasMany → reminders

📌 **One active tenant per unit** (enforce at app level).

---

## 5️⃣ invoices (RENT ENGINE)

Everything revolves around this table.

```sql
invoices
---------
id (PK)
invoice_number (unique)
tenant_id (FK)
unit_id (FK)
rent_amount
extra_charges DEFAULT 0
total_amount
due_date
status ENUM('pending','paid','overdue')
issued_at
created_at
updated_at
```

🔗 Relationships:

* belongsTo → tenant
* belongsTo → unit
* hasMany → payments
* hasOne → demand_note

💡 **Never delete invoices**. Audit integrity.

---

## 6️⃣ payments

Tracks actual cash flow.

```sql
payments
---------
id (PK)
invoice_id (FK)
tenant_id (FK)
amount
payment_method ENUM('cash','mobile_money','bank')
received_by (FK → users.id)
payment_date
created_at
```

🔗 Relationships:

* belongsTo → invoice
* belongsTo → tenant
* belongsTo → user (staff/admin)

📌 Partial payments allowed.

---

## 7️⃣ receipts (AUTO-GENERATED)

Issued immediately after payment.

```sql
receipts
---------
id (PK)
receipt_number (unique)
payment_id (FK)
issued_by (FK → users.id)
issued_at
created_at
```

🔗 Relationships:

* belongsTo → payment
* belongsTo → user

🚫 No updates allowed after creation.

---

## 8️⃣ demand_notes (OVERDUE ENFORCEMENT)

Uganda-style rent enforcement.

```sql
demand_notes
-------------
id (PK)
invoice_id (FK)
note_number (unique)
outstanding_amount
issued_at
created_at
```

🔗 Relationships:

* belongsTo → invoice

📄 PDF only – no edits.

---

## 9️⃣ reminders

System & SMS-ready notifications.

```sql
reminders
----------
id (PK)
tenant_id (FK)
invoice_id (FK, nullable)
type ENUM('upcoming','due_today','overdue','demand')
status ENUM('pending','sent','failed')
sent_at (nullable)
created_at
```

🔗 Relationships:

* belongsTo → tenant
* belongsTo → invoice (optional)

---

## 🔟 bills (EXPENSES)

Keeps landlord honest.

```sql
bills
------
id (PK)
property_id (FK)
type ENUM('water','power','garbage','maintenance')
amount
due_date
status ENUM('pending','paid')
created_at
updated_at
```

🔗 Relationships:

* belongsTo → property

---

## 1️⃣1️⃣ settings (SYSTEM CONFIG)

One row only.

```sql
settings
---------
id (PK)
company_name
company_phone
company_address
invoice_prefix
receipt_prefix
default_due_days
penalty_percentage
created_at
updated_at
```

📌 Accessed frequently → cache it.

---

# 🔗 RELATIONSHIP DIAGRAM (MENTAL MODEL)

```
Property
  └── Units
        └── Tenant
              └── Invoices
                    └── Payments
                          └── Receipt

Invoices
  └── Demand Note
  └── Reminders
```

---

# ⚠️ CRITICAL DESIGN RULES

✔ Never delete financial records
✔ Status is **derived**, not manually edited
✔ Overdue = due_date < today AND status != paid
✔ Receipt created **only via payment**

---

# 🚀 WHAT THIS SCHEMA ENABLES

* Clean monthly invoice generation
* Partial payments
* Proper overdue logic
* Legal-looking demand notes
* Clean PDF exports
* Future SMS without schema changes

---

## NEXT STEP (Your Choice)

2️⃣ **Laravel Controllers & Validation (code-level)**
3️⃣ **Next.js Pages → API Wiring (real UI calls)**
4️⃣ **Uganda-friendly PDF invoice & receipt layouts**

Say **“Next: Laravel Controllers”** and we continue 👊
