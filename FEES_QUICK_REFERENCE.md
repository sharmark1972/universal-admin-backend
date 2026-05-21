# Fees System - Quick Reference

## File Locations

| Component | Path |
|-----------|------|
| Public Fees Page | `/src/app/fees/page.tsx` |
| Admin Management | `/src/app/admin/fees/page.tsx` |
| API Route | `/src/app/api/admin/fees/route.ts` |
| Documentation | `/FEES_SYSTEM_GUIDE.md` |

## Key URLs

| Feature | URL | Access |
|---------|-----|--------|
| View Fees | `/fees` | Public |
| Manage Fees | `/admin/fees` | Admin Only |
| API Endpoint | `/api/admin/fees` | Admin Only |

## Default Fee Structure

| Item | Amount | Condition |
|------|--------|-----------|
| Submission | FREE | Always free |
| Publication | ₹15,000 | Up to 6 pages |
| Extra Pages | ₹1,000 | Per page beyond 6 |
| Plagiarism Check | ₹1,000 | If not by author |
| Rewriting/Formatting | ₹2,000 | If not by author |
| Rapid Publication | ₹30,000 | Optional fast-track |
| Discount | 50% | Economically weaker sections |

## Calculator Logic Quick Check

```
1. Start with base: ₹0 (submission is free)
2. Add publication: ₹15,000 (base)
3. Add extra pages: +(pages - 6) × ₹1,000
4. Add plagiarism if checked: +₹1,000
5. Add rewriting if checked: +₹2,000
6. Add rapid publication if checked: +₹30,000
7. Apply discount if eligible: × 0.5
8. Result = Total APC
```

## Common Scenarios

### Scenario 1: 5-page paper with all author-submitted items
- Base: ₹15,000
- Extra: ₹0 (≤ 6 pages)
- Total: **₹15,000**

### Scenario 2: 8-page paper without plagiarism report
- Base: ₹15,000
- Extra: 2 × ₹1,000 = ₹2,000
- Plagiarism: ₹1,000
- Total: **₹18,000**

### Scenario 3: 10-page paper, needs all services + rapid
- Base: ₹15,000
- Extra: 4 × ₹1,000 = ₹4,000
- Plagiarism: ₹1,000
- Rewriting: ₹2,000
- Rapid: ₹30,000
- **Subtotal: ₹52,000**
- With 50% discount: **₹26,000**

## Admin Tasks

### To Change a Fee

1. Go to `/admin/fees`
2. Update the relevant field
3. See preview update in real-time
4. Click "Save Changes"
5. Confirm success message

### To Apply Discount

1. Go to `/admin/fees`
2. Scroll to "Discount Settings"
3. Change the percentage (e.g., 50 for 50%)
4. Click "Save Changes"

## Code Examples

### Fetch Current Fees (Frontend)

```typescript
const response = await fetch('/api/admin/fees');
const { data } = await response.json();
console.log(data.baseFee); // 15000
```

### Calculate APC (Formula)

```typescript
const subtotal = 
  0 + // submission (free)
  15000 + // base publication
  Math.max(0, pages - 6) * 1000 + // extra pages
  (includePlagiarism ? 1000 : 0) +
  (includeRewriting ? 2000 : 0) +
  (includeRapidPublication ? 30000 : 0);

const discount = isEconomicallyWeaker ? Math.floor(subtotal * 0.5) : 0;
const total = subtotal - discount;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Admin page shows loading spinner | Check NextAuth session, ensure user is logged in |
| Save button is disabled | Make sure you've actually changed a value |
| Calculator shows wrong amount | Check page count input and toggle states |
| API returns 401 | Ensure session exists (login as admin) |
| Fees don't update after save | Refresh page or clear cache |

## Features Checklist

- [x] Public fees page with full pricing structure
- [x] Interactive APC calculator
- [x] Admin management interface
- [x] Fee configuration API
- [x] Input validation
- [x] Error handling
- [x] Success notifications
- [x] Responsive design
- [x] SEO optimization
- [x] Discount support
- [x] Multiple service add-ons
- [x] Example calculations
- [x] FAQ section

## Next Steps for Production

1. [ ] Connect to Prisma database
2. [ ] Add audit logging
3. [ ] Integrate payment gateway (Razorpay/Stripe)
4. [ ] Add invoice generation
5. [ ] Create payment tracking
6. [ ] Add email notifications
7. [ ] Set up admin analytics
8. [ ] Test with real transactions

---

**Last Updated:** January 2025
