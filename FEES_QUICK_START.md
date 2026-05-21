# Fees System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: View the Public Fees Page
1. Navigate to `http://localhost:3000/fees`
2. See the complete fee structure displayed
3. Scroll down to find the APC calculator
4. Test the calculator with different inputs

### Step 2: Test the Calculator
```
Scenario: 8-page paper, needs plagiarism check
1. Enter "8" in the page count field
2. Check the "Plagiarism Checking" box
3. Leave other options unchecked
4. Observe:
   - Publication: ₹15,000 + (2 × ₹1,000) = ₹17,000
   - Plagiarism: ₹1,000
   - Total: ₹18,000
```

### Step 3: Access Admin Panel
1. Login to your account (you must be authenticated)
2. Navigate to `http://localhost:3000/admin/fees`
3. See all current fee values in the form
4. See the fee structure preview

### Step 4: Update a Fee (Test)
```
Example: Change base publication from ₹15,000 to ₹16,000
1. Scroll to "Base Publication Fee" field
2. Clear the current value (15000)
3. Enter "16000"
4. Notice "Save Changes" button becomes enabled
5. Click "Save Changes"
6. See success message: "Fee configuration updated successfully"
7. Message auto-dismisses after 3 seconds
```

### Step 5: Reset Changes
```
If you want to revert:
1. Click "Reset" button
2. Form reverts to last saved values
3. "Save Changes" button becomes disabled
```

---

## 📚 File Reference

### For Users
**Public Fees Page**: `/fees`
- View pricing structure
- Calculate APC for your paper
- See discounts and options

### For Admins
**Admin Panel**: `/admin/fees`
- Configure all fee values
- See real-time preview
- Save and apply changes

### For Developers
**API Endpoint**: `/api/admin/fees`
- GET: Retrieve current configuration
- POST: Update configuration (admin only)

---

## 💡 Common Tasks

### Calculate APC for a 10-page paper

**With author-submitted items:**
```
Publication: ₹15,000 + (4 × ₹1,000) = ₹19,000
Total: ₹19,000
```

**Without plagiarism & rewriting, but with rapid publication:**
```
Publication: ₹19,000
Plagiarism: ₹1,000
Rewriting: ₹2,000
Rapid: ₹30,000
Total: ₹52,000
```

**With 50% discount (economically weaker section):**
```
Subtotal: ₹52,000
Discount: -₹26,000 (50%)
Total: ₹26,000
```

### Change the discount percentage

1. Go to `/admin/fees`
2. Scroll to "Discount Settings" section
3. Change "Discount Percentage" value
4. See preview update in real-time
5. Click "Save Changes"

### Verify fee changes applied

**Method 1: Browser Dev Tools**
```javascript
// Open browser console (F12)
// Run this command:
fetch('/api/admin/fees')
  .then(r => r.json())
  .then(data => console.log(data))
```

**Method 2: Manual Calculation**
- Go to `/fees`
- Input test values
- Verify calculation matches new fees

---

## 🔧 API Quick Reference

### Get Current Fees
```bash
curl http://localhost:3000/api/admin/fees
```

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

### Update Fees
```bash
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

---

## ❓ Troubleshooting

### Calculator shows wrong amount
- [ ] Check page count input (minimum 1, maximum 100)
- [ ] Verify all toggles are in correct state
- [ ] Clear browser cache and reload
- [ ] Check browser console for errors

### Can't access admin panel
- [ ] Make sure you're logged in
- [ ] Check that your session is valid
- [ ] Try logging out and logging back in
- [ ] Clear cookies if persistent issue

### Save button doesn't work
- [ ] Make sure you've changed at least one value
- [ ] Check that numbers are valid (non-negative)
- [ ] Check discount is 0-100%
- [ ] Look for error message above form

### API returns 401 error
- [ ] You're not authenticated
- [ ] Login first via `/auth/signin`
- [ ] Check your session cookie
- [ ] Verify you're authorized as admin

---

## 📖 Documentation Files

| Document | Purpose | Audience |
|----------|---------|----------|
| This File | Quick start | Everyone |
| FEES_QUICK_REFERENCE.md | Code examples | Developers |
| FEES_SYSTEM_GUIDE.md | Full guide | Implementers |
| FEES_TESTING_GUIDE.md | Test cases | QA/Testers |
| FEES_ARCHITECTURE.md | System design | Architects |
| FEES_IMPLEMENTATION_SUMMARY.md | Overview | Project Managers |
| FEES_VERIFICATION_CHECKLIST.md | Verification | QA |

---

## ✅ Quick Checklist

### Before Going Live
- [ ] Tested calculator with various inputs
- [ ] Verified fee updates in admin panel
- [ ] Checked SEO on `/fees` page
- [ ] Tested on mobile/tablet/desktop
- [ ] Verified API endpoints work
- [ ] Checked error messages display correctly
- [ ] Verified authentication works
- [ ] Tested with different discount values

### For Production Deployment
- [ ] Review FEES_IMPLEMENTATION_SUMMARY.md production checklist
- [ ] Connect to database (update API route)
- [ ] Set up audit logging
- [ ] Test with real fee scenarios
- [ ] Create user documentation
- [ ] Train admin team
- [ ] Set up monitoring

---

## 🎯 Next Steps

### Immediate
1. ✅ Test public fees page
2. ✅ Test admin panel
3. ✅ Verify calculations
4. ✅ Check on different devices

### Short Term
1. Deploy to production
2. Train admin team
3. Create user documentation
4. Monitor for issues

### Medium Term
1. Connect to database
2. Add audit logging
3. Integrate payment gateway
4. Set up analytics

---

## 📞 Support

**Questions?** Check these docs in order:
1. This Quick Start Guide (common tasks)
2. FEES_QUICK_REFERENCE.md (code examples)
3. FEES_SYSTEM_GUIDE.md (detailed info)
4. FEES_TESTING_GUIDE.md (testing steps)

**Still stuck?**
1. Check browser console for errors
2. Review server logs
3. Try the example calculations
4. Verify auth is working

---

## 🎉 You're All Set!

The fees system is ready to use:
- ✅ Public fees page shows pricing
- ✅ Calculator works in real-time
- ✅ Admin panel manages fees
- ✅ API endpoints functional
- ✅ Documentation complete

**Start using it now!**

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready to Use ✅
