1️⃣ DATABASE DESIGN (Bills & Expenses)
A. Bills (Payables)

Bills are amounts you owe to vendors, sometimes recurring, sometimes chargeable to tenants.

🗄️ bills table
bills
-----
id
property_id          (nullable)
unit_id              (nullable)
vendor_id            (nullable)
bill_type            (water, electricity, service, internet, other)
reference_number     (optional)
billing_period_start
billing_period_end
amount
due_date
status               (pending, paid, overdue)
is_recurring         (boolean)
recurrence_cycle     (monthly, quarterly, yearly)
charge_tenants       (boolean)
notes
created_at
updated_at

🗄️ bill_payments table
bill_payments
-------------
id
bill_id
amount
payment_date
payment_method       (cash, bank, mobile money)
reference
created_at
updated_at

🗄️ vendors table
vendors
-------
id
name
email
phone
address
created_at
updated_at


📌 Why this works

A bill can belong to a property or unit

Bills can be recurring

Bills can optionally be passed to tenants

Bills are separated from tenant rent logic (clean design)

B. Expenses (Operational Costs)

Expenses are money you spend to run properties, not billed to tenants.

🗄️ expenses table
expenses
--------
id
property_id          (nullable)
unit_id              (nullable)
expense_category_id
amount
description
expense_date
payment_method
reference
attachment           (file path)
created_by           (user_id)
created_at
updated_at

🗄️ expense_categories table
expense_categories
------------------
id
name                (Maintenance, Repairs, Salaries, Utilities, Legal)
created_at
updated_at


📌 Why expenses are separate

They do not generate invoices

They affect profit & loss

They support attachments (receipts)

C. Optional (Advanced but powerful)
🗄️ property_financial_settings
property_financial_settings
---------------------------
id
property_id
allow_bill_to_tenant
default_service_charge
created_at
updated_at

2️⃣ LARAVEL MODELS & RELATIONSHIPS
A. Bill Model
class Bill extends Model
{
    protected $fillable = [
        'property_id',
        'unit_id',
        'vendor_id',
        'bill_type',
        'amount',
        'due_date',
        'status',
        'is_recurring',
        'charge_tenants'
    ];

    public function property() {
        return $this->belongsTo(Property::class);
    }

    public function unit() {
        return $this->belongsTo(Unit::class);
    }

    public function vendor() {
        return $this->belongsTo(Vendor::class);
    }

    public function payments() {
        return $this->hasMany(BillPayment::class);
    }
}

B. Expense Model
class Expense extends Model
{
    protected $fillable = [
        'property_id',
        'unit_id',
        'expense_category_id',
        'amount',
        'description',
        'expense_date'
    ];

    public function property() {
        return $this->belongsTo(Property::class);
    }

    public function unit() {
        return $this->belongsTo(Unit::class);
    }

    public function category() {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
}

C. Vendor Model
class Vendor extends Model
{
    protected $fillable = ['name', 'email', 'phone'];

    public function bills() {
        return $this->hasMany(Bill::class);
    }
}


📌 Key integration point

Bills can later inject line items into invoices

Expenses affect reports only

3️⃣ NEXT.JS PAGES & ROUTES (UI STRUCTURE)

This follows your existing routing style:

/en/apps/rentals/...

A. Bills Pages
/apps/rentals/bills
/apps/rentals/bills/list
/apps/rentals/bills/add
/apps/rentals/bills/edit/[id]
/apps/rentals/bills/details/[id]

UI reuse

Use InvoiceListTable for bills list

Use AddCard / EditCard from invoices

Use Status chips (Paid / Pending / Overdue)

B. Bill Payments
/apps/rentals/bills/payments/record
/apps/rentals/bills/payments/history/[billId]


Reuse:

AddPaymentDrawer.tsx

Payment history table

C. Expenses Pages
/apps/rentals/expenses
/apps/rentals/expenses/list
/apps/rentals/expenses/add
/apps/rentals/expenses/edit/[id]

UI patterns

Similar to Payments UI

Attach receipt upload

Category dropdown (searchable)

D. Reports Enhancement (Big Win)

Add widgets to:

/apps/rentals/reports

New report cards

Total Rent Collected

Total Expenses

Outstanding Bills

Net Profit

Charts:

Bar chart → Income vs Expenses

Donut → Expense Categories

Line → Monthly Cash Flow

Use:

ApexBarChart

ApexDonutChart

ApexLineChart

4️⃣ HOW THIS FITS YOUR CURRENT SYSTEM (IMPORTANT)

✔ No breaking changes
✔ Clean separation of concerns
✔ Reuses theme UI
✔ Scales to multi-property
✔ Clients immediately see value
