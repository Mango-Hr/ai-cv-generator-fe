# Chat Debugging Guide

## Current Issue: "Loading chats" Stuck

The chat page is showing "Loading chats..." but not progressing. This guide helps diagnose why.

---

## Quick Diagnosis (2 minutes)

### Step 1: Open DevTools
```
Press F12 or Right-click → Inspect
Go to Console tab
```

### Step 2: Navigate to Chat
1. Fill and submit the resume form (or use Auto-fill)
2. You should get a `submission_id` and be redirected to chat
3. Watch the console for logs

### Step 3: Look for These Logs

```
✅ GOOD - You should see:
Initializing chat with submission: {id} token: {token}...
Fetching message history...
Fetching messages from: https://...messages
Submission ID: {id}
Access Token: {token}...
Fetch Messages Response Status: 200
```

❌ **BAD - If you see:**
```
Fetch Messages Response Status: 401
Fetch Messages Response Status: 403
Fetch Messages Response Status: 404
Fetch Messages Response Status: 0 (network error)
CORS error
```

---

## Possible Issues & Fixes

### Issue 1: CORS Error
**Error in console:**
```
Access to fetch at '...messages' from origin 'https://ai-cv-generator-fe.onrender.com' 
has been blocked by CORS policy
```

**Cause:** Backend missing `Access-Control-Allow-Origin` header

**Fix:** Backend team needs to enable CORS (see BACKEND_CORS_ACTION_PLAN.md)

---

### Issue 2: 401 Unauthorized
**Error:**
```
Fetch Messages Response Status: 401
Backend error response: {message: "Unauthorized"}
```

**Cause:** Access token is missing or invalid

**Possible reasons:**
1. `localStorage` didn't save the access_token from submission response
2. Access token expired
3. Access token format is wrong

**Debug:**
```javascript
// In browser console, check what's stored:
localStorage.getItem('submission_YOUR_ID')

// Should show:
{
  "access_token": "06a8b794-dcbe-7599-8000-0780de874f7a",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Fix:**
1. Check that submission response includes `access_token`
2. Verify localStorage is saving it correctly
3. Check that ClientChat is reading it: `localStorage.getItem(\`submission_${submissionId}\`)`

---

### Issue 3: 404 Not Found
**Error:**
```
Fetch Messages Response Status: 404
```

**Cause:** Backend endpoint doesn't exist or submission_id is wrong

**Debug:**
```javascript
// Check the URL being called:
// Should be: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions/{submission_id}/messages

// Check submission_id format:
// Should be UUID like: 06a8b794-de7a-78f0-8000-712f666b52f8
```

**Fix:**
1. Verify endpoint exists on backend
2. Verify submission_id is correct (check URL query params)
3. Verify submission_id matches what's stored in localStorage

---

### Issue 4: Network Error (Status 0)
**Error:**
```
Fetch Messages Response Status: 0
net::ERR_FAILED
```

**Cause:** Network unreachable, timeout, or connection refused

**Possible reasons:**
1. Backend server is down
2. Network connectivity issue
3. Railway service sleeping (on free tier)
4. Firewall blocking

**Debug:**
```bash
# Test if backend is reachable:
curl -v https://ai-cv-generator-be-production.up.railway.app/health

# Should return 200 (or any response, not timeout)
```

**Fix:**
1. Check if Railway backend service is running
2. Check network connectivity (open backend URL in browser)
3. Wait for Railway to wake up (might take 30 seconds after inactivity)

---

### Issue 5: Empty Message History
**Logs show:**
```
Fetch Messages Response Status: 200
Message history fetched: 0 messages
```

**Cause:** This is normal! First submission has no messages yet.

**Expected:** Chat should show empty, ready for new messages

**Verify:** Input field should be active, you can type a message

---

## Backend API Schema (Reference)

### Fetch Messages Endpoint
```
GET /api/v1/public/submissions/{submission_id}/messages
Headers:
  X-Client-Access-Token: {access_token}
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Messages fetched successfully",
  "data": {
    "conversation_id": "conv-uuid",
    "submission_id": "sub-uuid",
    "messages": [
      {
        "id": "msg-uuid",
        "sender_type": "client" | "staff",
        "sender_name": "You" | "Staff Name",
        "message": "Hello!",
        "attachments": [],
        "is_read": true,
        "created_at": "2026-08-23T20:30:54Z",
        "updated_at": "2026-08-23T20:35:10Z"
      }
    ]
  }
}
```

**Errors:**
- `401`: Missing/invalid `X-Client-Access-Token`
- `404`: submission_id doesn't exist
- `400`: Missing required fields

---

## Step-by-Step Debugging

### 1. Verify Form Submission Works
```javascript
// Check console after submitting resume form
// Should see:
Submission successful: {
  status: "success",
  status_code: 201,
  submission_id: "...",
  access_token: "...",
  ...
}
```

### 2. Verify Data Saved to localStorage
```javascript
// In browser console, after submission redirect:
const id = new URL(window.location).searchParams.get('id')
localStorage.getItem(`submission_${id}`)

// Should return:
{
  "access_token": "06a8b794-dcbe-7599-8000-0780de874f7a",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

### 3. Verify ClientChat Can Read It
```javascript
// Check URL parameters
const submissionId = new URL(window.location).searchParams.get('id')
console.log('Submission ID from URL:', submissionId)

// Check stored data
const stored = localStorage.getItem(`submission_${submissionId}`)
console.log('Stored data:', stored)

// Should be non-empty JSON
```

### 4. Verify Chat Component Gets Token
```javascript
// Once on chat page, check console logs:
Initializing chat with submission: {submissionId} token: {accessToken}...

// Token should NOT be "MISSING"
```

### 5. Verify API Request is Sent
```javascript
// In DevTools Network tab:
1. Go to Chat page
2. Open Network tab (F12 → Network)
3. Filter by: messages
4. You should see:
   GET /api/v1/public/submissions/{id}/messages

// Check Request Headers:
X-Client-Access-Token: 06a8b794-dcbe-7599-8000-...
Content-Type: application/json

// Check Response:
Status: 200 (or error status)
Body: JSON with messages array
```

---

## Console Log Examples

### ✅ Successful Load
```
Initializing chat with submission: 06a8b794-de7a-78f0-8000-712f666b52f8 token: 06a8b794-dcbe-7599-...
Fetching message history...
Fetching messages from: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions/06a8b794-de7a-78f0-8000-712f666b52f8/messages
Submission ID: 06a8b794-de7a-78f0-8000-712f666b52f8
Access Token: 06a8b794-dcbe-...
Fetch Messages Response Status: 200
Fetch Messages Response Headers: {
  content-type: application/json,
  access-control-allow-origin: https://ai-cv-generator-fe.onrender.com,
  ...
}
Message history fetched successfully: 0 messages
```

### ❌ CORS Error
```
Fetching messages from: https://ai-cv-generator-be-production.up.railway.app/...
Fetch Messages Response Status: 0
Error fetching messages: Failed to fetch
Full error: TypeError: Failed to fetch

CORS error in DevTools:
Access to fetch at '...' from origin 'https://ai-cv-generator-fe.onrender.com' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check
```

### ❌ 401 Unauthorized
```
Fetch Messages Response Status: 401
Backend error response: {
  status: "error",
  message: "Unauthorized - Invalid or missing access token"
}
```

---

## Recovery Steps

### If Chat is Stuck on Loading:

1. **Refresh page** (Ctrl+R)
   - Sometimes helps with network issues
   
2. **Re-submit form** (if refresh doesn't help)
   - Go back to home
   - Fill form again with Auto-fill
   - Submit
   - Should get new submission_id and access_token

3. **Clear browser cache** (if still stuck)
   - Ctrl+Shift+Delete
   - Clear Cache
   - Refresh page

4. **Check backend status**
   - Open: https://ai-cv-generator-be-production.up.railway.app/health
   - Should respond (not timeout)
   - If timeout → backend is sleeping

5. **Check browser console** for specific errors
   - F12 → Console tab
   - Look for red error messages
   - Share the exact error with backend team

---

## Testing Checklist

- [ ] Form submission returns submission_id
- [ ] localStorage saves access_token
- [ ] URL contains ?id={submission_id}
- [ ] Chat page loads without console errors
- [ ] DevTools Network shows 200 status for /messages request
- [ ] X-Client-Access-Token header is sent
- [ ] Response includes messages array (even if empty)
- [ ] Input field is enabled
- [ ] Can type and send messages

---

## Common Messages & What They Mean

| Message | Meaning | Next Step |
|---------|---------|-----------|
| "Loading chats..." | Fetching messages from backend | Wait or check console |
| "Failed to load messages: Failed to fetch" | Network/CORS issue | Check console for CORS error |
| "Failed to load messages: HTTP 401" | Invalid access token | Re-submit form |
| "Failed to load messages: HTTP 404" | Wrong submission_id | Check URL parameters |
| "Failed to connect to chat" | WebSocket connection failed | REST API will still work |

---

## When to Contact Backend Team

If you see these errors, contact backend team:

1. **Status 401 Unauthorized**
   - Token validation issue
   
2. **Status 404 Not Found**
   - Endpoint doesn't exist
   - Wrong API path
   
3. **Status 500 Server Error**
   - Backend application error
   - Check backend logs
   
4. **CORS Error**
   - Backend needs CORS headers
   - Use BACKEND_CORS_ACTION_PLAN.md

5. **Connection timeout**
   - Backend not responding
   - Check if Railway service is running

---

## Performance Notes

**Expected times:**
- Message fetch: < 1 second (usually 200-500ms)
- WebSocket connection: < 2 seconds
- First message display: < 3 seconds total

**If taking longer:**
- Might be Railway service waking up
- Might be slow network
- Check DevTools Network tab for slow requests

---

## Next Steps

After chat loads successfully:

1. ✅ Try sending a test message
2. ✅ Check if message appears immediately
3. ✅ Test file upload (if available)
4. ✅ Check WebSocket connection (look for `Connected to WebSocket`)

If any of these fail, use this guide to debug further.

---

**Last Updated:** August 23, 2026  
**Build:** Latest  
**Frontend Ready:** ✅ Yes  
**Backend Ready:** ⏳ Waiting for CORS
