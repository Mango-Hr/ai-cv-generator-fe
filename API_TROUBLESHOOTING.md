# API Troubleshooting Guide

## Error: "Failed to fetch"

This error means the frontend cannot reach the backend API. Here's how to debug:

### Step 1: Check API URL

1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see logs like:
   ```
   Making submission request to: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions
   API_BASE_URL: https://ai-cv-generator-be-production.up.railway.app
   ```

**If API_BASE_URL is empty or localhost:**
- Edit `.env` file
- Set: `VITE_API_BASE_URL=https://ai-cv-generator-be-production.up.railway.app`
- Save and reload the app

### Step 2: Check if Backend is Running

Open terminal and test:
```bash
curl -X GET https://ai-cv-generator-be-production.up.railway.app/health
```

**Expected response:**
```json
{"status": "ok"}
```

**If you get connection refused or timeout:**
- Backend service is not running
- Check Railway dashboard to restart the service
- Verify the URL is correct

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Try to submit the form
3. Look for the request to `/api/v1/public/submissions`

**Check the response:**
- **Status 200**: Success (but data might be wrong)
- **Status 400**: Bad request (check form data)
- **Status 500**: Server error (backend issue)
- **CORS error**: See Step 4
- **Connection failed**: Backend is down

### Step 4: Check for CORS Issues

If you see CORS error in console:
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:5174' 
has been blocked by CORS policy
```

**Solution on Backend:**
Add CORS headers to the API response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
```

### Step 5: Verify Environment Variable

Check if `.env` file exists and has correct URL:

```
cat .env
# Should show:
# VITE_API_BASE_URL=https://ai-cv-generator-be-production.up.railway.app
```

If wrong:
1. Edit `.env`
2. Update `VITE_API_BASE_URL`
3. Restart dev server: `npm run dev`

### Step 6: Test with curl

Test the endpoint directly:

```bash
curl -X POST https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "target_position": "Senior Engineer",
    "target_company": "Tech Corp",
    "priority": "normal",
    "job_description": "Looking for a senior engineer",
    "raw_data": {
      "education": [{"institution": "MIT", "degree": "BS", "field_of_study": "CS", "start_date": "2020-01-01", "end_date": "2024-01-01"}],
      "experience": [{"company": "Google", "role": "Engineer", "start_date": "2024-01-01", "end_date": "2024-12-31"}],
      "skills": ["JavaScript", "React"],
      "certifications": []
    }
  }'
```

**Expected response:**
```json
{
  "id": "SUB-2024-001",
  "access_token": "token_string",
  "status": "received",
  "created_at": "2026-08-23T..."
}
```

---

## Common Issues & Solutions

### Issue 1: "Failed to connect to backend"

**Symptoms:**
- Error in form submission
- Console shows "Failed to fetch"

**Solutions:**
1. Check backend is running: `curl https://ai-cv-generator-be-production.up.railway.app/health`
2. Check `.env` has correct URL
3. Check firewall/network allows HTTPS
4. If on Railway, check service is not sleeping (free plan sleeps after 15 min inactivity)

### Issue 2: CORS Blocked

**Symptoms:**
- Error mentions "CORS" or "cross-origin"
- Network tab shows OPTIONS request with error

**Solutions:**
1. Backend needs CORS headers
2. Add to backend response headers:
   - `Access-Control-Allow-Origin: *` (or specific domain)
   - `Access-Control-Allow-Methods: POST, GET, PATCH, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token`

### Issue 3: 400 Bad Request

**Symptoms:**
- Status 400 in network tab
- Error message about invalid data

**Solutions:**
1. Check form data matches API schema
2. Verify required fields are filled
3. Check data types (dates should be ISO strings, not Date objects)
4. Look at API error response for details

### Issue 4: 500 Server Error

**Symptoms:**
- Status 500 in network tab
- Generic server error

**Solutions:**
1. Check backend logs on Railway
2. Verify database is connected
3. Check backend environment variables
4. Restart the backend service

### Issue 5: Network Timeout

**Symptoms:**
- Request takes very long
- Eventually fails with timeout error

**Solutions:**
1. Backend might be sleeping (Railway free plan)
2. Wake it up by accessing: `https://ai-cv-generator-be-production.up.railway.app/health`
3. Try request again
4. Or upgrade to paid plan (no sleep)

---

## Development Testing

### Local Backend (if you have one)

1. Start local backend:
   ```bash
   cd /path/to/backend
   npm start
   ```

2. Update `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Restart frontend:
   ```bash
   npm run dev
   ```

4. Test form submission

### Production Backend

1. Keep `.env`:
   ```
   VITE_API_BASE_URL=https://ai-cv-generator-be-production.up.railway.app
   ```

2. Verify backend is running:
   ```bash
   curl https://ai-cv-generator-be-production.up.railway.app/health
   ```

3. Check Railway dashboard for service status

---

## Debug Console Output

When you submit the form, you should see in DevTools Console:

```
Making submission request to: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions
API_BASE_URL: https://ai-cv-generator-be-production.up.railway.app
Response status: 200
Submission successful: {id: "SUB-2024-001", access_token: "token...", ...}
```

If you don't see this:
1. Check Console tab is selected
2. Try submitting again
3. Look for error messages

---

## Backend API Schema

The submission endpoint expects:

```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "email",
  "phone": "string (optional)",
  "target_position": "string",
  "target_company": "string (optional)",
  "priority": "normal|high|urgent",
  "job_description": "string",
  "existing_cv_url": "string (optional)",
  "raw_data": {
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "field_of_study": "string",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "description": "string"
      }
    ],
    "experience": [
      {
        "company": "string",
        "role": "string",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "description": "string"
      }
    ],
    "skills": ["string"],
    "certifications": [
      {
        "name": "string",
        "issuing_organization": "string",
        "issue_date": "YYYY-MM-DD",
        "expiration_date": "YYYY-MM-DD"
      }
    ],
    "custom_notes": "string"
  }
}
```

---

## Quick Checklist

- [ ] Backend is running
- [ ] `VITE_API_BASE_URL` is set in `.env`
- [ ] Frontend is restarted after `.env` change
- [ ] Backend has CORS enabled
- [ ] Health check works: `curl https://api-url/health`
- [ ] Network tab shows successful request (200 status)
- [ ] Response includes `id` and `access_token`

---

## Getting Help

1. Check this guide first
2. Look at browser Console tab for error messages
3. Check Network tab for failed requests
4. Verify backend is running on Railway dashboard
5. Check backend logs for errors

---

**Last Updated:** August 23, 2026
