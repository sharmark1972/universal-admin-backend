# Fees System - Testing Guide

## Test Execution Checklist

### 1. Public Fees Page (`/fees`)

#### Load & Display
- [ ] Page loads without errors
- [ ] Header with title "Publication Fees" displays
- [ ] Breadcrumbs show: Home > Publication Fees
- [ ] Three highlight cards appear (Free Submission, Competitive Rates, Discounts)

#### Fee Structure Cards
- [ ] All 6 fee items display correctly:
  - [ ] Submission (Free)
  - [ ] Publication (₹15,000)
  - [ ] Extra Pages (₹1,000)
  - [ ] Plagiarism Checking (₹1,000)
  - [ ] Rewriting & Formatting (₹2,000)
  - [ ] Rapid Publication (₹30,000)
- [ ] Each card shows icon, label, amount, description
- [ ] Cards have proper styling and spacing

#### APC Calculator
- [ ] Calculator appears in sticky sidebar
- [ ] Number input field works (min: 1, max: 100)
- [ ] Default page count is 5

##### Test Case 1: Basic Calculation (5 pages, no add-ons)
```
Input:
- Pages: 5
- Plagiarism: unchecked
- Rewriting: unchecked
- Rapid Publication: unchecked
- Discount: unchecked

Expected Output:
- Publication: ₹15,000
- Total: ₹15,000
```
- [ ] Result matches expected output
- [ ] Breakdown shows only publication fee

##### Test Case 2: Extra Pages (8 pages, no add-ons)
```
Input:
- Pages: 8
- All unchecked

Expected Output:
- Publication: ₹15,000 + (2 × ₹1,000) = ₹17,000
- Total: ₹17,000
```
- [ ] Result matches expected output
- [ ] Breakdown shows base + extra pages

##### Test Case 3: With Services (6 pages + plagiarism + rewriting)
```
Input:
- Pages: 6
- Plagiarism: checked
- Rewriting: checked
- Others: unchecked
- Discount: unchecked

Expected Output:
- Publication: ₹15,000
- Plagiarism: ₹1,000
- Rewriting: ₹2,000
- Total: ₹18,000
```
- [ ] Result matches expected output
- [ ] All three items in breakdown

##### Test Case 4: With Discount (6 pages + all services + discount)
```
Input:
- Pages: 6
- Plagiarism: checked
- Rewriting: checked
- Rapid Publication: checked
- Discount: checked

Expected Output:
- Publication: ₹15,000
- Plagiarism: ₹1,000
- Rewriting: ₹2,000
- Rapid: ₹30,000
- Subtotal: ₹48,000
- Discount (50%): -₹24,000
- Total: ₹24,000
```
- [ ] Result matches expected output
- [ ] Discount appears in breakdown with negative sign
- [ ] Discount message shows in green

##### Test Case 5: Edge Cases
- [ ] Setting page count to 1: Shows ₹15,000
- [ ] Setting page count to 100: Shows ₹15,000 + (94 × ₹1,000) = ₹109,000
- [ ] Setting page count to 6: Shows exactly ₹15,000 (no extra page charge)
- [ ] Toggling each checkbox individually updates total
- [ ] Un-toggling checkboxes removes those charges

#### Eligible Countries Section
- [ ] List of 10 economically weaker countries displays
- [ ] Countries shown in grid format
- [ ] Discount percentage (50%) is mentioned
- [ ] Eligibility note is visible

#### FAQ Section
- [ ] All 6 FAQ items display
  - [ ] "Is submission free?"
  - [ ] "Can I pay in installments?"
  - [ ] "What if my paper exceeds 6 pages?"
  - [ ] "Do I get a refund if rejected?"
  - [ ] "How do I qualify for the 50% discount?"
  - [ ] "What does rapid publication include?"
- [ ] Each FAQ has Q&A format

#### Contact Section
- [ ] Contact Us link works (goes to `/contact`)
- [ ] Download Fee Schedule button is present

#### SEO & Metadata
- [ ] Page title includes "Publication Fees"
- [ ] Meta description is present
- [ ] Structured data (schema) is included
- [ ] Breadcrumb structured data is present

---

### 2. Admin Fees Management (`/admin/fees`)

#### Access Control
- [ ] Unauthenticated user redirected to login
- [ ] After login, admin page loads

#### Page Load
- [ ] Back to Admin link works
- [ ] Title "Publication Fees Management" displays
- [ ] All form sections load

#### Form Fields Load
- [ ] Base Publication Fee field: shows 15000
- [ ] Per Page Fee field: shows 1000
- [ ] Plagiarism Fee field: shows 1000
- [ ] Rewriting Fee field: shows 2000
- [ ] Rapid Publication Fee field: shows 30000
- [ ] Discount Percentage field: shows 50

#### Preview Section
- [ ] Current fees display in preview box
- [ ] All 6 fees shown with correct formatting

#### Example Calculation
- [ ] Example calculation displays correctly
- [ ] Shows 10-page paper scenario
- [ ] Includes breakdown and discount calculation

#### Form Interactions

##### Test Case 1: Change One Fee
- [ ] Click on Base Publication Fee field
- [ ] Change value from 15000 to 16000
- [ ] Observe "Save Changes" button becomes enabled
- [ ] "Reset" button becomes enabled
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Wait 3 seconds (message auto-disappears)
- [ ] Refresh page
- [ ] Value remains 16000 (if using database, else shows default)
- [ ] Reset value back to 15000

##### Test Case 2: Change Discount Percentage
- [ ] Change discount from 50 to 40
- [ ] Preview updates to show 40%
- [ ] Save changes
- [ ] Verify success message
- [ ] Reset back to 50

##### Test Case 3: Input Validation
- [ ] Try entering negative value: Should show error
- [ ] Try entering -100 in discount: Should show error "must be between 0 and 100"
- [ ] Try entering 150 in discount: Should show error
- [ ] Try entering "abc" in number field: Should not accept
- [ ] Enter 0 in a fee field: Should accept and save

#### Validation Messages
- [ ] Negative fees show: "All fees must be non-negative"
- [ ] Invalid discount shows: "Discount percentage must be between 0 and 100"
- [ ] Required fields enforce input

#### Button States
- [ ] Save button disabled when no changes
- [ ] Save button enabled when changes exist
- [ ] Reset button disabled when no changes
- [ ] Reset button enabled when changes exist
- [ ] Save button shows "Saving..." text while saving
- [ ] Save button shows spinner while saving
- [ ] Buttons disabled while saving

#### Error Handling
- [ ] Network error shows error message
- [ ] Authorization error shows "Unauthorized" message
- [ ] Success message shows in green with checkmark
- [ ] Error message shows in red with alert icon

---

### 3. API Endpoint Tests (`/api/admin/fees`)

#### GET Request
```bash
curl -X GET http://localhost:3000/api/admin/fees
```

Expected Response:
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

- [ ] Response status is 200
- [ ] All 6 fee fields present
- [ ] Values match expected defaults
- [ ] Success flag is true

#### POST Request (Valid)
```bash
curl -X POST http://localhost:3000/api/admin/fees \
  -H "Content-Type: application/json" \
  -d '{
    "baseFee": 16000,
    "perPageFee": 1200,
    "plagiarismFee": 1000,
    "rewritingFee": 2000,
    "rapidPublicationFee": 30000,
    "discountPercentage": 50
  }'
```

Expected Response: Status 200 with success message
- [ ] Response status is 200
- [ ] Success flag is true
- [ ] Updated data returned
- [ ] GET request confirms changes saved

#### POST Request (Invalid - Negative Values)
```bash
curl -X POST http://localhost:3000/api/admin/fees \
  -H "Content-Type: application/json" \
  -d '{"baseFee": -1000, ...}'
```

Expected Response: Status 400 with error message
- [ ] Response status is 400
- [ ] Error message: "fees cannot be negative"
- [ ] Original values unchanged

#### POST Request (Invalid - Discount Out of Range)
```bash
curl -X POST http://localhost:3000/api/admin/fees \
  -H "Content-Type: application/json" \
  -d '{"discountPercentage": 150, ...}'
```

Expected Response: Status 400
- [ ] Response status is 400
- [ ] Error message mentions "0 and 100"

#### POST Request (Unauthorized)
Without auth cookies/session:
```bash
curl -X POST http://localhost:3000/api/admin/fees \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Expected Response: Status 401
- [ ] Response status is 401
- [ ] Message: "Unauthorized"

---

### 4. Integration Tests

#### Test Case 1: Fee Change Propagation
1. [ ] Update fee via admin page
2. [ ] Refresh public fees page
3. [ ] Calculator still shows old value (in-memory only for now)
4. [ ] Note: For production with DB, would reflect immediately

#### Test Case 2: Calculator Accuracy
1. [ ] Admin changes base fee to 20000
2. [ ] Reload fees page
3. [ ] Calculator should use whatever default is (won't change in current in-memory impl)
4. [ ] Manual calculation matches

#### Test Case 3: Multiple Service Combinations
- [ ] Test all combinations of checkboxes:
  - [ ] Plagiarism only
  - [ ] Rewriting only
  - [ ] Rapid only
  - [ ] Plagiarism + Rewriting
  - [ ] Plagiarism + Rapid
  - [ ] Rewriting + Rapid
  - [ ] All three
- [ ] Each combination calculates correctly

---

### 5. Responsive Design Tests

#### Mobile (< 768px)
- [ ] Fees page stacks vertically
- [ ] Calculator sidebar appears below content
- [ ] Fee cards display in single column
- [ ] Text is readable
- [ ] Buttons are properly sized for touch

#### Tablet (768px - 1024px)
- [ ] Layout adjusts appropriately
- [ ] Grid shows 2-3 columns
- [ ] Calculator visible
- [ ] No horizontal scrolling

#### Desktop (> 1024px)
- [ ] 3-column grid for highlights
- [ ] 2-column layout: fees + sticky calculator
- [ ] Proper spacing and alignment
- [ ] No wrapping issues

---

### 6. Cross-Browser Tests

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

---

### 7. Performance Tests

#### Load Time
- [ ] Fees page loads in < 2 seconds
- [ ] Admin page loads in < 2 seconds
- [ ] API response in < 500ms

#### Calculator Responsiveness
- [ ] Page count input updates instantly
- [ ] Checkboxes toggle instantly
- [ ] Total recalculates instantly (no lag)

---

## Test Summary Template

```
Date: ___________
Tester: _________
Environment: ____

Public Fees Page: PASSED / FAILED
Admin Page: PASSED / FAILED
API Endpoints: PASSED / FAILED
Integration: PASSED / FAILED
Responsive: PASSED / FAILED

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

**Last Updated:** January 2025
