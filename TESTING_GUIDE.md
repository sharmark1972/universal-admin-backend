# Testing Guide - Library & Paper Details Pages

## Library Page (/library) - Test Cases

### Search Functionality
- [ ] **Test 1.1**: Type in search box and verify debouncing (should wait ~500ms before searching)
- [ ] **Test 1.2**: Search for a paper title and verify results appear
- [ ] **Test 1.3**: Search for an author name and verify correct papers show
- [ ] **Test 1.4**: Search for a keyword and verify papers with that keyword appear
- [ ] **Test 1.5**: Search with empty query and verify all papers show

### Filtering
- [ ] **Test 2.1**: Select a category and verify only papers in that category appear
- [ ] **Test 2.2**: Enter author name in author filter and verify papers by that author appear
- [ ] **Test 2.3**: Set date range and verify papers within that range appear
- [ ] **Test 2.4**: Combine multiple filters (category + author) and verify correct results
- [ ] **Test 2.5**: Combine search query with filters and verify combined filtering works

### Sorting
- [ ] **Test 3.1**: Click "Publication Date" sort and verify papers are sorted by date
- [ ] **Test 3.2**: Click "Most Downloaded" sort and verify papers are sorted by download count
- [ ] **Test 3.3**: Click "Title (A-Z)" sort and verify papers are sorted alphabetically
- [ ] **Test 3.4**: Click "Highest Rated" sort and verify papers are sorted by rating
- [ ] **Test 3.5**: Toggle between ascending/descending and verify sort order changes

### Pagination
- [ ] **Test 4.1**: Verify pagination shows correct number of total papers
- [ ] **Test 4.2**: Click "Next" and verify page changes
- [ ] **Test 4.3**: Click "Previous" and verify page changes correctly
- [ ] **Test 4.4**: Click on specific page number and verify correct page loads
- [ ] **Test 4.5**: Verify pagination controls are disabled at first/last page

### View Modes
- [ ] **Test 5.1**: Click Grid icon and verify papers display in grid layout (3 columns on desktop)
- [ ] **Test 5.2**: Click List icon and verify papers display in list layout (1 column)
- [ ] **Test 5.3**: Verify layout is responsive on mobile (switches to single column)

### User Interactions
- [ ] **Test 6.1**: Click "View" button and navigate to paper detail page
- [ ] **Test 6.2**: Click "Download" button as logged-in user and verify PDF downloads
- [ ] **Test 6.3**: Click "Download" as guest and verify login prompt appears
- [ ] **Test 6.4**: Click "Clear Filters" and verify all filters reset
- [ ] **Test 6.5**: Click "Filters" button on mobile and verify sidebar appears

### Display & Visual
- [ ] **Test 7.1**: Verify paper cards show category badge
- [ ] **Test 7.2**: Verify paper cards show publication date
- [ ] **Test 7.3**: Verify paper cards show 2 keywords with "+X more" indicator
- [ ] **Test 7.4**: Verify download count and rating display correctly
- [ ] **Test 7.5**: Verify loading skeleton appears while fetching papers

### Edge Cases
- [ ] **Test 8.1**: Search with special characters and verify handling
- [ ] **Test 8.2**: Set future date range and verify no results
- [ ] **Test 8.3**: Rapidly change filters and verify API calls are debounced
- [ ] **Test 8.4**: Verify "No papers found" message when search returns no results
- [ ] **Test 8.5**: Verify error message appears if API call fails

---

## Paper Detail Page (/papers/[id]) - Test Cases

### Page Loading
- [ ] **Test 1.1**: Verify loading spinner appears while fetching paper
- [ ] **Test 1.2**: Verify paper data loads and displays correctly
- [ ] **Test 1.3**: Verify "Paper Not Found" message appears for invalid paper ID
- [ ] **Test 1.4**: Verify breadcrumbs show correct navigation path

### Paper Information
- [ ] **Test 2.1**: Verify paper title displays prominently
- [ ] **Test 2.2**: Verify category badge appears
- [ ] **Test 2.3**: Verify publication date displays
- [ ] **Test 2.4**: Verify authors list displays with proper formatting
- [ ] **Test 2.5**: Verify abstract displays in full

### Cover & Media
- [ ] **Test 3.1**: Verify cover image displays if available
- [ ] **Test 3.2**: Verify PDF thumbnail displays if no cover image
- [ ] **Test 3.3**: Verify placeholder displays if neither cover nor PDF available
- [ ] **Test 3.4**: Verify sidebar remains sticky while scrolling on desktop

### Metadata Display
- [ ] **Test 4.1**: Verify publication information section displays correctly
- [ ] **Test 4.2**: Verify volume, issue, and year display (if available)
- [ ] **Test 4.3**: Verify DOI displays as clickable link (if available)
- [ ] **Test 4.4**: Verify keywords display in chip format
- [ ] **Test 4.5**: Verify statistics (downloads, views, rating) display correctly

### Citation
- [ ] **Test 5.1**: Verify citation format is correct (Author Year format)
- [ ] **Test 5.2**: Verify "Copy Citation" button works
- [ ] **Test 5.3**: Verify button changes to "Copied!" after clicking
- [ ] **Test 5.4**: Verify citation text is properly formatted and readable

### Reviews & Ratings
- [ ] **Test 6.1**: Verify rating summary displays (average and count)
- [ ] **Test 6.2**: Verify review list displays (if reviews exist)
- [ ] **Test 6.3**: As logged-in user, verify review form appears
- [ ] **Test 6.4**: As guest user, verify login prompt appears instead of form
- [ ] **Test 6.5**: Verify "View All Reviews" button works and expands list

### Review Submission
- [ ] **Test 7.1**: Select 5-star rating and verify visual feedback
- [ ] **Test 7.2**: Add review comment and verify text appears
- [ ] **Test 7.3**: Click "Submit Review" and verify review is added
- [ ] **Test 7.4**: Verify error if trying to submit without rating
- [ ] **Test 7.5**: Verify form clears after successful submission

### Actions
- [ ] **Test 8.1**: Click "Back to Library" and navigate to library page
- [ ] **Test 8.2**: Click Share button and verify sharing works
- [ ] **Test 8.3**: Click Bookmark button and verify visual feedback (filled/unfilled)
- [ ] **Test 8.4**: Click Download button as logged-in user and verify PDF downloads
- [ ] **Test 8.5**: Click Download as guest and verify login prompt

### Responsive Design
- [ ] **Test 9.1**: Verify layout on desktop (sidebar + main content)
- [ ] **Test 9.2**: Verify layout on tablet (responsive adjustments)
- [ ] **Test 9.3**: Verify layout on mobile (stacked/single column)
- [ ] **Test 9.4**: Verify all buttons are accessible on mobile
- [ ] **Test 9.5**: Verify text is readable at all screen sizes

### Visual Design
- [ ] **Test 10.1**: Verify consistent color scheme throughout
- [ ] **Test 10.2**: Verify hover states on interactive elements
- [ ] **Test 10.3**: Verify proper spacing and typography
- [ ] **Test 10.4**: Verify loading spinner displays correctly
- [ ] **Test 10.5**: Verify no visual glitches or overlapping elements

---

## Cross-Browser Testing

Run tests on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Performance Testing

- [ ] **Speed 1**: Library page with 100+ papers loads in < 2 seconds
- [ ] **Speed 2**: Search debouncing reduces API calls (max 1 per second during typing)
- [ ] **Speed 3**: Page transitions are smooth without lag
- [ ] **Speed 4**: Loading skeletons appear quickly (< 100ms)
- [ ] **Speed 5**: PDF thumbnail loads without blocking page

---

## Accessibility Testing

- [ ] **A11y 1**: All buttons are keyboard accessible (Tab navigation)
- [ ] **A11y 2**: All images have alt text
- [ ] **A11y 3**: Color contrast meets WCAG standards
- [ ] **A11y 4**: Form inputs are properly labeled
- [ ] **A11y 5**: Links are distinguishable from regular text

---

## Notes

- Test on different network speeds (throttle in DevTools)
- Check console for any errors or warnings
- Verify meta tags are correct with DevTools inspector
- Test with actual data from production (if safe)
- Document any issues found with screenshots

---

## Known Limitations (To Address)

1. PDF download requires authentication
2. Review rating distribution chart uses random data (should use real distribution)
3. Related papers feature not yet implemented
4. Citation formats limited to one format (could add APA, MLA, etc.)
5. No advanced search operators (AND, OR, NOT)

---

## Sign-Off

- [ ] All tests passed
- [ ] No console errors
- [ ] No accessibility issues
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Ready for production
