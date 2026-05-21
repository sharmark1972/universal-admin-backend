# Publication Fees System - Implementation Guide

## Overview

The publication fees system includes three main components:

1. **Public Fees Page** (`/fees`) - Displays fee structure and APC calculator
2. **Admin Fees Management** (`/admin/fees`) - Allows admins to configure fees
3. **API Route** (`/api/admin/fees`) - Backend for fees CRUD operations

## Files Created

### 1. Public Fees Page
**File:** `/src/app/fees/page.tsx`

**Features:**
- Comprehensive fee structure display with icons and descriptions
- Interactive APC (Article Processing Charge) calculator
- Real-time cost breakdown based on user inputs
- 50% discount eligibility information
- FAQ section with 10 common questions
- SEO optimization with DynamicSEO and schema markup
- Breadcrumb navigation
- Responsive design for all devices

**Key Components:**
- Fee structure cards showing all charges
- Calculator with page count input
- Service add-on toggles (plagiarism, rewriting, rapid publication)
- Discount eligibility checkbox
- Live cost breakdown
- Sticky calculator sidebar

**Pricing Structure:**
```
Submission: FREE
Publication (base, ≤6 pages): ₹15,000
Extra pages (6+): ₹1,000 per page
Plagiarism checking: ₹1,000 (if not by author)
Rewriting & formatting: ₹2,000 (if not by author)
Rapid publication: ₹30,000 (optional)
Discount: 50% (for economically weaker sections)
```

### 2. Admin Fees Management Page
**File:** `/src/app/admin/fees/page.tsx`

**Features:**
- Admin-only access with NextAuth session verification
- Organized form sections for different fee categories
- Real-time preview of fee structure
- Example calculation for reference
- Input validation with error messages
- Success/error notifications
- Reset and Save functionality
- Change detection (Save button only enabled when changes exist)
- Loading states for data fetching

**Sections:**
1. **Base Publication Fees**
   - Base publication fee (up to 6 pages)
   - Per-page fee (beyond 6 pages)

2. **Additional Services**
   - Plagiarism checking fee
   - Rewriting & formatting fee

3. **Special Services**
   - Rapid publication fee

4. **Discount Settings**
   - Discount percentage (0-100%)

**Preview & Calculation:**
- Live preview of all fees in current configuration
- Example calculation showing a 10-page paper without author-submitted reports
- Shows both with and without discount application

### 3. API Route for Fees Management
**File:** `/src/app/api/admin/fees/route.ts`

**Endpoints:**

#### GET /api/admin/fees
Retrieves current fee configuration.

**Response:**
```json
{
  "success": true,
  "message": "Fee configuration retrieved successfully",
  "data": {
    "baseFee": 15000,
    "perPageFee": 1000,
    "plagiarismFee": 1000,
    "rewritingFee": 2000,
    "rapidPublicationFee": 30000,
    "discountPercentage": 50
  }
}
```

#### POST /api/admin/fees
Updates fee configuration (admin only).

**Request Body:**
```json
{
  "baseFee": 15000,
  "perPageFee": 1000,
  "plagiarismFee": 1000,
  "rewritingFee": 2000,
  "rapidPublicationFee": 30000,
  "discountPercentage": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configuration updated successfully",
  "data": { ... }
}
```

**Error Handling:**
- 401: Unauthorized (no session)
- 400: Invalid input (negative values, invalid discount percentage)
- 500: Server error

## Calculator Logic

The APC calculator implements the following business logic:

```typescript
// Base calculation
const submission = 0; // Always free
const basePublication = 15000; // Standard fee
const extraPages = Math.max(0, numPages - 6); // Pages beyond 6
const publication = basePublication + (extraPages * 1000);

// Add-on services (optional)
const plagiarism = includePlagiarism ? 1000 : 0;
const rewriting = includeRewriting ? 2000 : 0;
const rapidPublication = includeRapidPublication ? 30000 : 0;

// Calculate subtotal
const subtotal = submission + publication + plagiarism + rewriting + rapidPublication;

// Apply discount if eligible
const discount = isEconomicallyChallenged ? Math.floor(subtotal * 0.5) : 0;

// Final total
const total = subtotal - discount;
```

## Integration Points

### With Existing Components
- Uses `DynamicSEO` for SEO optimization
- Uses `Breadcrumbs` for navigation
- Uses `WebsiteSchema` for structured data
- Uses Lucide React icons for UI elements
- Uses TailwindCSS for styling
- Uses NextAuth for authentication

### Frontend Integration
To embed the calculator on other pages:

```tsx
// Create a reusable component if needed
import FeesPage from '@/app/fees/page';

// Or extract calculator logic
const [calculation, setCalculation] = useState<APCCalculation>({...});
```

### Database Integration (Future)
Current implementation uses in-memory storage. For production:

```prisma
model FeeConfiguration {
  id                    String    @id @default(cuid())
  baseFee              Int       @default(15000)
  perPageFee           Int       @default(1000)
  plagiarismFee        Int       @default(1000)
  rewritingFee         Int       @default(2000)
  rapidPublicationFee  Int       @default(30000)
  discountPercentage   Int       @default(50)
  updatedAt            DateTime  @updatedAt
  updatedBy            String?
  
  @@index([updatedAt])
}

model FeeAuditLog {
  id              String    @id @default(cuid())
  adminId         String
  adminEmail      String?
  action          String    // "update"
  oldValues       Json
  newValues       Json
  timestamp       DateTime  @default(now())
  
  @@index([adminId, timestamp])
}
```

## Testing Guide

### Manual Testing

1. **Public Fees Page:**
   - Navigate to `/fees`
   - Verify all sections load correctly
   - Test calculator with different page counts (1, 6, 7, 10, etc.)
   - Toggle plagiarism checkbox and verify +1000 calculation
   - Toggle rewriting checkbox and verify +2000 calculation
   - Toggle rapid publication and verify +30000 calculation
   - Test discount checkbox and verify 50% reduction
   - Test combinations (multiple add-ons with discount)
   - Verify "Submit Paper" button links to `/submit`

2. **Admin Fees Management:**
   - Login as admin
   - Navigate to `/admin/fees`
   - Verify current fees load correctly
   - Change one fee value
   - Verify "Save Changes" button is enabled
   - Click Save
   - Verify success message appears
   - Refresh page and verify changes persisted
   - Test validation (try negative values)
   - Test discount percentage (try >100)

3. **API Routes:**
   ```bash
   # Test GET
   curl -X GET http://localhost:3000/api/admin/fees
   
   # Test POST (requires authentication)
   curl -X POST http://localhost:3000/api/admin/fees \
     -H "Content-Type: application/json" \
     -d '{
       "baseFee": 15000,
       "perPageFee": 1000,
       "plagiarismFee": 1000,
       "rewritingFee": 2000,
       "rapidPublicationFee": 30000,
       "discountPercentage": 50
     }'
   ```

### Example Calculations to Test

1. **Basic 5-page paper with all author-submitted items:**
   - Expected: ₹15,000

2. **8-page paper without plagiarism checking:**
   - Expected: ₹15,000 + (2 × ₹1,000) + ₹1,000 = ₹18,000

3. **10-page paper without any author items:**
   - Expected: ₹15,000 + (4 × ₹1,000) + ₹1,000 + ₹2,000 = ₹22,000

4. **Same as #3 with 50% discount:**
   - Expected: ₹22,000 × 0.5 = ₹11,000

5. **6-page paper with rapid publication:**
   - Expected: ₹15,000 + ₹30,000 = ₹45,000

## Configuration

### Updating Default Fees

To change the default fees, edit `/src/app/api/admin/fees/route.ts`:

```typescript
let feeConfiguration = {
  baseFee: 15000,        // Change here
  perPageFee: 1000,      // Change here
  plagiarismFee: 1000,   // Change here
  rewritingFee: 2000,    // Change here
  rapidPublicationFee: 30000, // Change here
  discountPercentage: 50  // Change here
};
```

## Future Enhancements

1. **Database Integration:**
   - Move from in-memory to Prisma database
   - Add audit logging for fee changes
   - Store user country/section for automatic discount qualification

2. **Payment Integration:**
   - Connect to Razorpay or Stripe for actual payments
   - Create payment tracking
   - Generate invoices

3. **Advanced Features:**
   - Multiple currency support
   - Tiered discounts based on paper metrics
   - Waived fees for special cases (guest editors, etc.)
   - Bulk discounts for multiple papers
   - Seasonal promotions

4. **Reporting:**
   - Admin dashboard with revenue tracking
   - Fee collection analytics
   - Discount usage reports
   - Payment status tracking

5. **User Experience:**
   - Compare fees across publication types
   - Download fee schedule as PDF
   - Email fee quote before submission
   - Payment reminder emails

## Support

For questions or issues with the fees system:
1. Check this documentation first
2. Review calculator logic in `/src/app/fees/page.tsx`
3. Check API responses in browser DevTools Network tab
4. Review server logs for backend errors

---

**Last Updated:** January 2025
**Status:** Initial Implementation Complete ✓
