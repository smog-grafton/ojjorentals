Alright, now we’re entering the **engine room**.
I’ll give you **real Laravel 12–style controllers + validation**, clean, scalable, and matching the schema we defined.

We’ll do this in **layers**, exactly how a senior backend engineer would.

---

# 🔐 1️⃣ AUTH CONTROLLER (API Token – Sanctum)

### `AuthController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('vinkyaba-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
```

---

# 🧍 2️⃣ TENANTS

## Validation – `StoreTenantRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'unit_id'         => 'required|exists:units,id',
            'full_name'       => 'required|string|max:255',
            'phone'           => 'required|string|max:20',
            'national_id'     => 'nullable|string|max:50',
            'rent_start_date' => 'required|date'
        ];
    }
}
```

---

## `TenantController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantRequest;
use App\Models\Tenant;

class TenantController extends Controller
{
    public function index()
    {
        return Tenant::with('unit')->latest()->get();
    }

    public function store(StoreTenantRequest $request)
    {
        $tenant = Tenant::create($request->validated());

        $tenant->unit->update(['status' => 'occupied']);

        return response()->json($tenant, 201);
    }

    public function show(Tenant $tenant)
    {
        return $tenant->load('unit', 'invoices');
    }

    public function update(StoreTenantRequest $request, Tenant $tenant)
    {
        $tenant->update($request->validated());
        return response()->json($tenant);
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->update(['status' => 'moved_out']);
        $tenant->unit->update(['status' => 'vacant']);

        return response()->json(['message' => 'Tenant moved out']);
    }
}
```

📌 **Note**: We never delete tenants.

---

# 🏠 3️⃣ UNITS

## `UnitController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return Unit::with('tenant')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'property_id'   => 'required|exists:properties,id',
            'unit_number'   => 'required|string',
            'monthly_rent'  => 'required|numeric|min:0'
        ]);

        return Unit::create($data);
    }

    public function update(Request $request, Unit $unit)
    {
        $unit->update($request->only('monthly_rent', 'status'));
        return $unit;
    }
}
```

---

# 💰 4️⃣ INVOICES (CORE LOGIC)

## Validation – `StoreInvoiceRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tenant_id'     => 'required|exists:tenants,id',
            'unit_id'       => 'required|exists:units,id',
            'rent_amount'   => 'required|numeric|min:0',
            'extra_charges' => 'nullable|numeric|min:0',
            'due_date'      => 'required|date'
        ];
    }
}
```

---

## `InvoiceController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Models\Invoice;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index()
    {
        return Invoice::with('tenant','unit')->latest()->get();
    }

    public function store(StoreInvoiceRequest $request)
    {
        $data = $request->validated();
        $data['invoice_number'] = 'INV-' . strtoupper(Str::random(6));
        $data['total_amount'] =
            $data['rent_amount'] + ($data['extra_charges'] ?? 0);
        $data['status'] = 'pending';
        $data['issued_at'] = now();

        return Invoice::create($data);
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load('payments', 'tenant', 'unit');
    }
}
```

---

# 💵 5️⃣ PAYMENTS (AUTOMATIC RECEIPTS)

## Validation – `StorePaymentRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'invoice_id'     => 'required|exists:invoices,id',
            'amount'         => 'required|numeric|min:1',
            'payment_method' => 'required|in:cash,mobile_money,bank'
        ];
    }
}
```

---

## `PaymentController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request)
    {
        $invoice = Invoice::findOrFail($request->invoice_id);

        $payment = Payment::create([
            'invoice_id'   => $invoice->id,
            'tenant_id'    => $invoice->tenant_id,
            'amount'       => $request->amount,
            'payment_method'=> $request->payment_method,
            'received_by'  => auth()->id(),
            'payment_date' => now()
        ]);

        $paid = $invoice->payments()->sum('amount');
        if ($paid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        }

        Receipt::create([
            'receipt_number' => 'RCT-' . strtoupper(Str::random(6)),
            'payment_id'     => $payment->id,
            'issued_by'      => auth()->id(),
            'issued_at'      => now()
        ]);

        return response()->json(['message' => 'Payment recorded']);
    }
}
```

---

# 🚨 6️⃣ OVERDUE LOGIC

## `OverdueController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;

class OverdueController extends Controller
{
    public function index()
    {
        return Invoice::where('due_date', '<', now())
            ->where('status', '!=', 'paid')
            ->with('tenant','unit')
            ->get();
    }
}
```

---

# 🧾 7️⃣ DEMAND NOTES

## `DemandNoteController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DemandNote;
use App\Models\Invoice;
use Illuminate\Support\Str;

class DemandNoteController extends Controller
{
    public function store(Invoice $invoice)
    {
        $note = DemandNote::create([
            'invoice_id' => $invoice->id,
            'note_number'=> 'DN-' . strtoupper(Str::random(6)),
            'outstanding_amount' => $invoice->total_amount
                - $invoice->payments()->sum('amount'),
            'issued_at' => now()
        ]);

        return $note;
    }
}
```

---

# 🧭 8️⃣ ROUTES (`routes/api.php`)

```php
Route::prefix('v1')->group(function () {

    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::apiResource('tenants', TenantController::class);
        Route::apiResource('units', UnitController::class)->except(['destroy']);
        Route::apiResource('invoices', InvoiceController::class);

        Route::post('/payments', [PaymentController::class, 'store']);
        Route::get('/overdue', [OverdueController::class, 'index']);
        Route::post('/demand-notes/{invoice}', [DemandNoteController::class, 'store']);
    });
});
```

---

# 🔒 WHY THIS SETUP IS STRONG

✔ Business rules live in backend
✔ Frontend cannot fake receipts or invoices
✔ Auditable financial flow
✔ Scales cleanly to SMS & mobile money

---

## NEXT STEP (Tell me to proceed)

👉 **Next.js pages → API wiring (real examples)**
or
👉 **PDF invoice & receipt templates (Uganda-friendly layout)**

Say the word and we continue 🚀
