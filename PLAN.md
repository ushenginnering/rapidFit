# Plan: Connect Instructors Page to API Endpoint

## Information Gathered
- `instructors.js` already calls `api.get('instructors')` → `https://gym.rapidsuite.ng/api/v1/instructors`
- `api.js` auto-attaches Bearer token from `localStorage.getItem('rapidfit_token')`
- Server proxy (`server.js`) handles `/instructors` routing to the real API
- Response format `{ success: true, data: [...] }` is already handled
- Form fields match the API payload (first_name, last_name, email, etc.)

## Issues to Fix
1. **CSV Export** uses `i.name` which is `undefined` for real API data (API returns `first_name` + `last_name`)
2. **CSV Export** exports all data instead of only filtered/search results
3. **Update TODO.md** to mark completion

## Files to Edit
1. `rapidFit/js/instructors.js` — Fix CSV export logic
2. `rapidFit/TODO.md` — Mark steps as completed

## Steps
- [x] Step 1: Analyze codebase (completed)
- [x] Step 2: Fix CSV Export to use computed fullName from first_name + last_name
- [x] Step 3: Fix CSV Export to export filtered data only
- [x] Step 4: Update TODO.md

