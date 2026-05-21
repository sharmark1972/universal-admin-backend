# Fees System - Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        IJARCM Fees System                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐              ┌──────────────────┐
│  Public Users   │              │   Admin Users    │
└────────┬────────┘              └────────┬─────────┘
         │                                │
         │                                │
         ▼                                ▼
    ┌─────────────┐              ┌────────────────────┐
    │  /fees page │              │  /admin/fees page  │
    │  (Public)   │              │  (Admin Only)      │
    └─────────────┘              └────────────────────┘
         │                                │
         │ Interactive Calculator         │ Configuration Form
         │ - Page count input             │ - 6 fee fields
         │ - Service toggles             │ - Validation
         │ - Discount checkbox           │ - Preview
         │ - Real-time calculation       │ - Save/Reset
         │                                │
         └────────────┬────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  API: /api/admin/fees       │
        │  (NextAuth Protected)       │
        ├─────────────────────────────┤
        │ GET  - Fetch config         │
        │ POST - Update config        │
        └─────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Fee Configuration Store    │
        │  (Currently: In-Memory)     │
        │  (Future: Prisma DB)        │
        └─────────────────────────────┘
```

---

## User Journey - Public Fees Page

```
User Visits /fees
        │
        ▼
┌──────────────────────────────┐
│ Loads Fees Page Component    │
├──────────────────────────────┤
│ • Header & Breadcrumbs       │
│ • Highlight Cards            │
│ • Fee Structure Cards        │
│ • FAQ Section                │
│ • Calculator Sidebar         │
└──────────────────────────────┘
        │
        ▼
    User Uses Calculator
        │
        ├─ Enters Page Count
        │  └─ [1 - 100]
        │
        ├─ Toggles Services
        │  ├─ Plagiarism Check  (+ ₹1,000)
        │  ├─ Rewriting         (+ ₹2,000)
        │  └─ Rapid Publication (+ ₹30,000)
        │
        ├─ Selects Discount
        │  └─ Eligible? (50% off)
        │
        ▼
  Real-time Calculation
        │
        ├─ Base: ₹15,000
        ├─ Extra Pages: ₹(pages-6) × 1,000
        ├─ Services: Selected costs
        ├─ Subtotal: Calculated
        ├─ Discount: If eligible
        ▼
   Display Total APC
        │
        ├─ Cost Breakdown
        ├─ Discount Amount
        └─ Final Total
```

---

## Admin Journey - Fee Management

```
Admin Visits /admin/fees
        │
        ▼
┌──────────────────────────────┐
│ Check NextAuth Session       │
├──────────────────────────────┤
│ • Authenticated? YES         │
│ • Continue to page           │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Fetch Current Config         │
│ GET /api/admin/fees          │
├──────────────────────────────┤
│ Loading spinner shows        │
│ Data loads into form         │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Admin Modifies Fees          │
├──────────────────────────────┤
│ Input: Base Fee              │
│ Input: Per Page Fee          │
│ Input: Plagiarism Fee        │
│ Input: Rewriting Fee         │
│ Input: Rapid Fee             │
│ Input: Discount %            │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Real-time Preview Updates    │
├──────────────────────────────┤
│ Shows all fees with new vals │
│ Example calculation updates  │
│ Save button becomes enabled  │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Submit Form                  │
│ POST /api/admin/fees         │
├──────────────────────────────┤
│ Data: New fee values         │
│ Validation: On backend       │
│ Auth: Check session          │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│ Validation & Response        │
├──────────────────────────────┤
│ ✓ Valid? → Success message   │
│ ✗ Invalid? → Error message   │
│ ✗ Auth fail? → 401 error     │
└──────────────────────────────┘
        │
        ▼
   Config Updated
   (Ready for public users)
```

---

## Calculator Logic Flow

```
calculateAPC() Function
        │
        ├─ Input Parameters:
        │  ├─ numPages: number
        │  ├─ includePlagiarism: boolean
        │  ├─ includeRewriting: boolean
        │  ├─ includeRapidPublication: boolean
        │  └─ isEconomicallyChallenged: boolean
        │
        ▼
    Step 1: Base Calculation
    ├─ submission = 0 (always free)
    ├─ basePublication = 15,000
    ├─ extraPages = max(0, numPages - 6) × 1,000
    ├─ plagiarism = includePlagiarism ? 1,000 : 0
    ├─ rewriting = includeRewriting ? 2,000 : 0
    └─ rapidPublication = includeRapidPublication ? 30,000 : 0
        │
        ▼
    Step 2: Sum Subtotal
    └─ subtotal = submission + basePublication + extraPages
                + plagiarism + rewriting + rapidPublication
        │
        ▼
    Step 3: Apply Discount
    └─ discount = isEconomicallyChallenged 
                ? floor(subtotal × 0.5) 
                : 0
        │
        ▼
    Step 4: Calculate Total
    └─ total = subtotal - discount
        │
        ▼
    Step 5: Return Object
    {
      submission,
      publication (basePublication + extraPages),
      plagiarism,
      rewriting,
      rapidPublication,
      discount,
      total
    }
        │
        ▼
    UI Updates with Breakdown
```

---

## Data Structure

### Fee Configuration Model

```typescript
interface FeeConfig {
  baseFee: number;              // ₹15,000 - Base publication
  perPageFee: number;           // ₹1,000 - Per extra page
  plagiarismFee: number;        // ₹1,000 - Plagiarism check
  rewritingFee: number;         // ₹2,000 - Rewriting service
  rapidPublicationFee: number;  // ₹30,000 - Fast track
  discountPercentage: number;   // 50 - Discount %
}
```

### APC Calculation Result

```typescript
interface APCCalculation {
  submission: number;       // ₹0 (always)
  publication: number;      // ₹15,000 + extra pages
  plagiarism: number;       // ₹1,000 or ₹0
  rewriting: number;        // ₹2,000 or ₹0
  rapidPublication: number; // ₹30,000 or ₹0
  discount: number;         // Applied if eligible
  total: number;            // Final APC
}
```

### API Response Format

```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  data?: FeeConfig;
}
```

---

## File Organization

```
e:/ijrcam/
├── src/
│   ├── app/
│   │   ├── fees/
│   │   │   └── page.tsx          [PUBLIC FEES PAGE]
│   │   │       ├─ 700 lines
│   │   │       ├─ Calculator logic
│   │   │       ├─ UI components
│   │   │       └─ SEO
│   │   │
│   │   ├── admin/
│   │   │   └── fees/
│   │   │       └── page.tsx      [ADMIN PANEL]
│   │   │           ├─ 550 lines
│   │   │           ├─ Form handling
│   │   │           ├─ Validation
│   │   │           └─ Notifications
│   │   │
│   │   └── api/
│   │       └── admin/
│   │           └── fees/
│   │               └── route.ts  [API ENDPOINT]
│   │                   ├─ 140 lines
│   │                   ├─ GET handler
│   │                   ├─ POST handler
│   │                   └─ Validation
│   │
│   └── components/
│       └── [existing components used]
│
└── [DOCUMENTATION FILES]
    ├── FEES_IMPLEMENTATION_SUMMARY.md
    ├── FEES_SYSTEM_GUIDE.md
    ├── FEES_QUICK_REFERENCE.md
    └── FEES_TESTING_GUIDE.md
```

---

## HTTP Request/Response Flows

### GET Request Flow

```
Browser/Client
    │
    ▼ GET /api/admin/fees
┌─────────────────────────────┐
│ API Handler                 │
├─────────────────────────────┤
│ export async function GET() │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ Return Current Config       │
├─────────────────────────────┤
│ success: true               │
│ data: {all fees}            │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ Response to Client          │
│ Status: 200                 │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ Admin Form Populated        │
│ Preview Updated             │
└─────────────────────────────┘
```

### POST Request Flow

```
Admin Form Submission
    │
    ├─ Validate client-side
    │  ├─ All fields numbers?
    │  ├─ No negative values?
    │  └─ Discount 0-100%?
    │
    ▼ POST /api/admin/fees
┌─────────────────────────────┐
│ API Handler                 │
├─────────────────────────────┤
│ Check NextAuth session      │
│ Validate request body       │
│ Verify value ranges         │
│ Update config               │
└─────────────────────────────┘
    │
    ├─ Success Path:
    │  ├─ Update in-memory store
    │  ├─ Return 200 OK
    │  └─ Include updated data
    │
    └─ Error Path:
       ├─ 401: No session
       ├─ 400: Invalid input
       └─ 500: Server error
    │
    ▼
┌─────────────────────────────┐
│ Response to Admin           │
├─────────────────────────────┤
│ Success: True/False         │
│ Message: Descriptive        │
│ Data: Updated config        │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ Admin Page Updates          │
│ • Shows success/error       │
│ • Updates preview           │
│ • Resets form state         │
└─────────────────────────────┘
```

---

## Component Dependencies

```
/fees (Public Page)
├─ React (hooks)
├─ Next.js (Link)
├─ DynamicSEO (component)
├─ WebsiteSchema (component)
├─ Breadcrumbs (component)
├─ Lucide React (icons)
├─ TailwindCSS (styling)
└─ useState, useCallback (hooks)

/admin/fees (Admin Page)
├─ React (hooks)
├─ Next.js (Link, useRouter)
├─ next-auth (useSession, getServerSession)
├─ Lucide React (icons)
├─ TailwindCSS (styling)
└─ useState, useEffect (hooks)

/api/admin/fees (API Route)
├─ Next.js (NextRequest, NextResponse)
├─ next-auth (getServerSession)
└─ Standard Node.js (JSON parsing)
```

---

## Validation Flow

```
User Input
    │
    ▼
┌──────────────────────────────┐
│ Client-Side Validation       │
│ (UI Prevents Invalid Input)  │
├──────────────────────────────┤
│ • Page count: 1-100          │
│ • Checkbox: boolean          │
│ • Numbers: positive          │
│ • Discount: 0-100%           │
└──────────────────────────────┘
    │ (If passes)
    ▼
┌──────────────────────────────┐
│ Server-Side Validation       │
│ (Data Integrity Check)       │
├──────────────────────────────┤
│ • Type check: all numbers    │
│ • Range check: no negatives  │
│ • Discount: 0-100%           │
│ • Auth check: session exists │
└──────────────────────────────┘
    │
    ├─ Valid: Update & Return 200
    │
    └─ Invalid: Return 400
```

---

## Pricing Scenarios Matrix

```
                    5p  8p  10p  15p  20p
Base Publication  15K 15K  15K  15K  15K
Extra Pages       -   2K   4K   9K   14K
───────────────────────────────────────
Subtotal          15K 17K  19K  24K  29K

With Plagiarism   16K 18K  20K  25K  30K
With Rewriting    17K 19K  21K  26K  31K
With Both         18K 20K  22K  27K  32K

With Rapid        45K 47K  49K  54K  59K
(All services)    48K 50K  52K  57K  62K

With 50% Discount:
5p:  7.5K
8p:  9K
10p: 10K-26K (varies)
```

---

## Error Handling Tree

```
POST /api/admin/fees
    │
    ├─ No Session?
    │  └─ Return 401: "Unauthorized"
    │
    ├─ Invalid JSON?
    │  └─ Return 400: "Bad Request"
    │
    ├─ Type Error?
    │  │  (baseFee is string instead of number)
    │  └─ Return 400: "Invalid fee values"
    │
    ├─ Negative Values?
    │  │  (baseFee = -1000)
    │  └─ Return 400: "Fees cannot be negative"
    │
    ├─ Discount Out of Range?
    │  │  (discountPercentage = 150)
    │  └─ Return 400: "Must be between 0 and 100"
    │
    ├─ Server Error?
    │  └─ Return 500: "Failed to update"
    │
    └─ Valid?
       └─ Update config & Return 200: Success
```

---

## Performance Considerations

```
Public Fees Page Load:
├─ HTML/CSS/JS: ~150KB
├─ Lucide Icons: ~50KB
├─ TailwindCSS: ~30KB
├─ DynamicSEO: ~10KB
└─ Total: ~240KB

Calculation Performance:
├─ Average: <1ms
├─ Complex (all options): <2ms
└─ Result: Instant UI update

API Response Time:
├─ GET config: <10ms (in-memory)
├─ POST update: <10ms (in-memory)
├─ With DB: ~50-100ms (estimated)
└─ Network: 100-300ms (varies)
```

---

**Last Updated**: January 2025
**Diagram Version**: 1.0
