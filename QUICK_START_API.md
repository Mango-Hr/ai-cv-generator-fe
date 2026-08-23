# Quick Start: API Integration

## 5-Minute Setup

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env and set your backend API URL
```

### 2. Verify Files
The following files are in place:
- ✅ `src/services/submissionService.js` - API service
- ✅ `src/pages/SubmitCV.jsx` - Form with API integration
- ✅ `.env` - Development config
- ✅ `.env.production` - Production config

### 3. Test Locally
```bash
npm run dev
# Visit http://localhost:5174/submit
# Fill form and submit
```

## What Happens When You Submit

1. **Form Validation:** All required fields checked
2. **Data Transformation:** Frontend data → API format
3. **API Call:** POST to `/api/v1/public/submissions`
4. **Success:** Redirect to `/submit/success?id={submissionId}`
5. **Error:** Show error toast and stay on form

## API Response Expected

```json
{
  "id": "SUB-2026-00123",
  "submission_id": "SUB-2026-00123",
  "status": "pending",
  "created_at": "2026-08-23T10:30:00Z"
}
```

## Key Files

| File | Purpose |
|------|---------|
| `src/services/submissionService.js` | API calls |
| `src/pages/SubmitCV.jsx` | Form + submission |
| `.env` | Config (dev) |
| `.env.production` | Config (prod) |
| `API_INTEGRATION.md` | Full documentation |

## Common Tasks

### Change API URL
Edit `.env`:
```env
VITE_API_BASE_URL=https://new-api.com
```

### Add a New Field
1. Add to form state in `SubmitCV.jsx`
2. Update transformation in `handleSubmit()`
3. Add to API payload

### Handle New Error Type
Edit `submissionService.js` error handling

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | http://localhost:3000 |

## Testing

### Happy Path
1. Fill all required fields
2. Add experience + education
3. Submit
4. See success page with ID

### Error Path
1. Leave required field empty
2. Try to submit
3. See validation error
4. Fix and resubmit

## Need Help?

- Check `API_INTEGRATION.md` for full details
- Check browser console for errors
- Check Network tab in DevTools
- Check backend logs for API errors

