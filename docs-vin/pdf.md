Perfect. This is the **final professional layer** — what the landlord, tenant, and even courts will *see*.
We’ll do **Uganda-friendly, legally clean, printable PDFs**.

I’ll give you:

1. PDF strategy (why & how)
2. Invoice PDF template
3. Receipt PDF template
4. Demand Note PDF template
5. Controller methods
6. Uganda-specific wording tips

All **Laravel 12 + DomPDF**, production-safe.

---

# 1️⃣ PDF STRATEGY (KEEP IT SIMPLE & STRONG)

### Library

```bash
composer require barryvdh/laravel-dompdf
```

### Config

```bash
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

📌 PDFs are:

* Generated **only in Laravel**
* Accessed via URL
* Opened in new tab from Next.js

---

# 2️⃣ GLOBAL PDF STYLE (ONE SOURCE OF TRUTH)

### `resources/views/pdf/layout.blade.php`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: DejaVu Sans, sans-serif;
      font-size: 12px;
      color: #000;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-top: 10px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    .table th, .table td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    .footer {
      margin-top: 30px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  @yield('content')
</body>
</html>
```

---

# 3️⃣ INVOICE PDF (MOST IMPORTANT DOCUMENT)

### `resources/views/pdf/invoice.blade.php`

```blade
@extends('pdf.layout')

@section('content')

<div class="header">
  <h2>{{ $settings->company_name }}</h2>
  <p>{{ $settings->company_address }}</p>
  <p>Tel: {{ $settings->company_phone }}</p>
  <div class="title">RENT INVOICE</div>
</div>

<p>
  <strong>Invoice No:</strong> {{ $invoice->invoice_number }}<br>
  <strong>Date Issued:</strong> {{ $invoice->issued_at->format('d M Y') }}<br>
  <strong>Due Date:</strong> {{ $invoice->due_date->format('d M Y') }}
</p>

<p>
  <strong>Tenant:</strong> {{ $invoice->tenant->full_name }}<br>
  <strong>Unit:</strong> {{ $invoice->unit->unit_number }}
</p>

<table class="table">
  <tr>
    <th>Description</th>
    <th>Amount (UGX)</th>
  </tr>
  <tr>
    <td>Monthly Rent</td>
    <td>{{ number_format($invoice->rent_amount) }}</td>
  </tr>
  @if($invoice->extra_charges > 0)
  <tr>
    <td>Extra Charges</td>
    <td>{{ number_format($invoice->extra_charges) }}</td>
  </tr>
  @endif
  <tr>
    <th>Total</th>
    <th>{{ number_format($invoice->total_amount) }}</th>
  </tr>
</table>

<div class="footer">
  <p>
    Kindly ensure payment is made on or before the due date.
    Late payments may attract penalties as per agreement.
  </p>
</div>

@endsection
```

---

# 4️⃣ RECEIPT PDF (PROOF OF PAYMENT)

### `resources/views/pdf/receipt.blade.php`

```blade
@extends('pdf.layout')

@section('content')

<div class="header">
  <h2>{{ $settings->company_name }}</h2>
  <div class="title">OFFICIAL RECEIPT</div>
</div>

<p>
  <strong>Receipt No:</strong> {{ $receipt->receipt_number }}<br>
  <strong>Date:</strong> {{ $receipt->issued_at->format('d M Y') }}
</p>

<p>
  <strong>Received From:</strong> {{ $receipt->payment->tenant->full_name }}<br>
  <strong>Unit:</strong> {{ $receipt->payment->invoice->unit->unit_number }}
</p>

<table class="table">
  <tr>
    <th>Description</th>
    <th>Amount (UGX)</th>
  </tr>
  <tr>
    <td>Rent Payment</td>
    <td>{{ number_format($receipt->payment->amount) }}</td>
  </tr>
</table>

<p>
  <strong>Payment Method:</strong> {{ ucfirst(str_replace('_',' ', $receipt->payment->payment_method)) }}
</p>

<div class="footer">
  <p>
    Thank you for your payment.<br>
    Issued by: {{ $receipt->issuer->name }}
  </p>
</div>

@endsection
```

---

# 5️⃣ DEMAND NOTE PDF (UGANDA-STYLE ENFORCEMENT)

### `resources/views/pdf/demand-note.blade.php`

```blade
@extends('pdf.layout')

@section('content')

<div class="header">
  <h2>{{ $settings->company_name }}</h2>
  <div class="title">DEMAND NOTICE</div>
</div>

<p>
  <strong>Notice No:</strong> {{ $note->note_number }}<br>
  <strong>Date:</strong> {{ $note->issued_at->format('d M Y') }}
</p>

<p>
  To:<br>
  <strong>{{ $note->invoice->tenant->full_name }}</strong><br>
  Unit: {{ $note->invoice->unit->unit_number }}
</p>

<p>
  This is to formally notify you that you have an outstanding rent balance of:
</p>

<h3>UGX {{ number_format($note->outstanding_amount) }}</h3>

<p>
  You are hereby required to clear the above amount immediately.
  Failure to do so may result in further action as provided by law.
</p>

<div class="footer">
  <p>
    Issued by Management<br>
    {{ $settings->company_name }}
  </p>
</div>

@endsection
```

---

# 6️⃣ PDF CONTROLLERS (REAL CODE)

### Invoice PDF

```php
use Barryvdh\DomPDF\Facade\Pdf;

public function pdf(Invoice $invoice)
{
    $settings = Setting::first();
    return Pdf::loadView('pdf.invoice', compact('invoice','settings'))
        ->stream("invoice-{$invoice->invoice_number}.pdf");
}
```

### Receipt PDF

```php
public function pdf(Receipt $receipt)
{
    $settings = Setting::first();
    return Pdf::loadView('pdf.receipt', compact('receipt','settings'))
        ->stream("receipt-{$receipt->receipt_number}.pdf");
}
```

### Demand Note PDF

```php
public function pdf(DemandNote $note)
{
    $settings = Setting::first();
    return Pdf::loadView('pdf.demand-note', compact('note','settings'))
        ->stream("demand-note-{$note->note_number}.pdf");
}
```

---

# 7️⃣ ROUTES

```php
Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
Route::get('/receipts/{receipt}/pdf', [ReceiptController::class, 'pdf']);
Route::get('/demand-notes/{note}/pdf', [DemandNoteController::class, 'pdf']);
```

---

# 🇺🇬 UGANDA-SPECIFIC BEST PRACTICES

✔ Currency **UGX only**
✔ Formal but respectful wording
✔ No threats, only “may result in action”
✔ Printable on black & white printers
✔ Clear unit references (courts love that)

---

# 🏁 YOU NOW HAVE A COMPLETE SYSTEM

✅ Database schema
✅ Secure Laravel backend
✅ Clean Next.js wiring
✅ Professional PDFs ready for landlords

---

## FINAL OPTIONAL UPGRADES

* Add QR code on receipts
* Stamp “PAID” watermark
* SMS with PDF link
* Tenant portal download access

If you want, next I can:
👉 **Review your actual repo structure**
👉 **Optimize for shared hosting**
👉 **Prep client demo checklist**

You’ve built a **real product**, not a toy 💪
