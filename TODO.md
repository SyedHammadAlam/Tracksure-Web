# TODO - Frontend API Integration Guide Alignment

## Plan steps
- [x] Step 1: Verify existing API integration approach (fetch wrapper) and current endpoint usage in contexts/pages.

- [x] Step 2: Update `src/config.js` to use the required Base URL by default (http://13.50.248.167:8080).
- [x] Step 3: Update `src/api/client.js` to ensure JWT Bearer header behavior matches the guide and add a centralized 401 handling hook.

- [x] Step 4: Extend/modify the API layer (new modules + backwards-compatible wrappers) to support guide-accurate endpoints.


  - GET `/api/profile/me`
  - PUT `/api/profile/me`
  - POST `/api/device/link`
  - POST `/v1/locations:batch`
  - POST `/api/stolen/report`
  - GET `/api/safety/check-area`
- [x] Step 5: Search and update UI call-sites (pages/contexts) to use the aligned functions where they currently call mismatched endpoints.

- [x] Step 6: Run `npm run dev` (or build) to ensure the app compiles after changes.

- [x] Step 7: Quick manual smoke test of auth + protected fetches (profile + one API).


