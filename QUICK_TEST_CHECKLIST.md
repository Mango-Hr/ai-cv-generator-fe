# Quick Test Checklist - Form to Chat Flow

## Complete End-to-End Test (5 minutes)

### Prerequisites
- Browser: Chrome/Firefox/Safari
- DevTools ready (F12)
- Clear browser cache or incognito window

---

## Test Steps

### 1. Load Application
```
URL: http://localhost:5174 (local) or https://ai-cv-generator-fe.onrender.com (prod)
Expected: Hero page with "Build Your Resume" CTA
Status: [ ] Pass / [ ] Fail
```

### 2. Navigate to Form
```
Click: "Build Your Resume" button
Expected: Form page with 6 steps (Personal, Job Target, Experience, etc.)
Status: [ ] Pass / [ ] Fail
```

### 3. Auto-Fill Form
```
Click: "📋 Auto-fill" button (top-right)
Expected: Form fills with sample data, jumps to Review step
Status: [ ] Pass / [ ] Fail
```

### 4. Submit Form
```
Click: "Submit Resume" button
Console: Watch for logs
Expected: 
  - "Submission successful" log
  - Gets submission_id and access_token
  - Redirects to chat page
Status: [ ] Pass / [ ] Fail

Console Check:
  [ ] "Making submission request to: https://..."
  [ ] "Response status: 200"
  [ ] "Submission successful: {...submission_id...}"
```

### 5. Chat Page Loads
```
Expected: 
  - Title: "Chat About Your Resume"
  - Empty state: "No messages yet. Start the conversation!"
  - Input field visible and active
Time: Should load within 2 seconds
Status: [ ] Pass / [ ] Fail

Console Check:
  [ ] "Initializing chat with submission: ..."
  [ ] "Message history fetched: 0 messages"
  [ ] "WebSocket connected" (or warning about WS)
```

### 6. Send First Message
```
Action:
  1. Click input field
  2. Type: "Hello, this is my first message"
  3. Click Send or press Ctrl+Enter

Expected:
  - Message appears in chat
  - Shows "You" as sender
  - Shows timestamp
  - Shows checkmark when sent
Status: [ ] Pass / [ ] Fail
```

### 7. Verify Network
```
Open: DevTools → Network tab
Filter: messages
Expected:
  [ ] GET .../messages → 200 (message history fetch)
  [ ] POST .../messages → 200 (send message)

Headers Check:
  [ ] X-Client-Access-Token present in requests
  [ ] Content-Type correct
```

### 8. Verify WebSocket
```
Open: DevTools → Network tab
Filter: WS (WebSocket)
Expected:
  [ ] WebSocket connection attempt to: wss://.../ws?token=...
  [ ] Status: 101 (Switching Protocols) or attempt shown

If WebSocket fails:
  [ ] Chat still works via REST (no error shown)
  [ ] Can still send/receive messages
```

---

## Error Scenarios (Expected Behaviors)

### ✅ New Client (No History)
```
Result: Empty chat, input enabled, can send messages
Status: [ ] Expected behavior
```

### ✅ After First Message
```
Result: Message appears in chat
Status: [ ] Expected behavior
```

### ✅ WebSocket Connection Fails
```
Result: Chat still works via REST API
Expected: Warning in console, but chat functional
Status: [ ] Expected behavior
```

### ❌ No Access Token
```
Result: Error message "Build your resume first"
Status: [ ] Expected error
```

### ❌ Wrong Submission ID
```
Result: Error message "Submission not found"
Status: [ ] Expected error
```

### ❌ Backend Down
```
Result: Error message with HTTP status
Status: [ ] Expected error
```

---

## Performance Checks

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| Form loads | < 2s | [ ] | [ ] |
| Auto-fill | < 1s | [ ] | [ ] |
| Form submit | < 2s | [ ] | [ ] |
| Chat loads | < 2s | [ ] | [ ] |
| Send message | < 2s | [ ] | [ ] |

---

## Browser Console Logs (Should See)

```
✅ Form Submission:
  Making submission request to: https://ai-cv-generator-be-production.up.railway.app/...
  Response status: 200
  Submission successful: { submission_id: "...", access_token: "...", ... }

✅ Chat Loading:
  Initializing chat with submission: {id} token: {token}...
  Fetching message history...
  Fetch Messages Response Status: 200
  Message history fetched: 0 messages

✅ WebSocket (if successful):
  WebSocket connected

⚠️ WebSocket (if fails):
  WebSocket connection failed (REST API will work): ...
```

---

## Quick Verification

### Happy Path (Everything Works)
```
Form → Submit → Chat → Send Message ✅
```

### Degraded Path (WebSocket Fails)
```
Form → Submit → Chat (no real-time) → Send Message ✅
```

### Error Path
```
Form → Submit → Error shown, user redirected
OR
Chat → Error shown, button to re-submit
```

---

## Automated Test Commands (Optional)

### Local Development
```bash
npm run dev
# Wait for "Local: http://localhost:5174"
# Then run manual test above
```

### Production Build
```bash
npm run build
npm run preview
# Wait for local preview URL
# Then run manual test above
```

### Run ESLint
```bash
npm run lint
# Should show no errors
```

---

## Test Results Summary

| Item | Status | Notes |
|------|--------|-------|
| Form loads | [ ] | |
| Auto-fill works | [ ] | |
| Form submits | [ ] | |
| Chat loads | [ ] | |
| Message history | [ ] | 0 messages expected |
| Input field | [ ] | Should be enabled |
| Send message | [ ] | |
| Message appears | [ ] | |
| Network 200 OK | [ ] | |
| Console no errors | [ ] | Warnings OK |

---

## Final Deployment Checklist

Before pushing to production:

- [ ] All tests pass locally
- [ ] Console has no red errors
- [ ] Form submission works
- [ ] Chat loads with empty state
- [ ] Can send first message
- [ ] Network requests have correct headers
- [ ] No secrets exposed in logs
- [ ] Build size reasonable
- [ ] All files committed to GitHub

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Form doesn't submit | Check console for errors |
| Chat shows error | Check that you're using correct submission_id |
| Chat says "Loading" forever | Check browser console, look for fetch error |
| Message won't send | Check network tab for POST error |
| WebSocket won't connect | Check console warning (OK if REST works) |

---

## Share This With Team

Print or screenshot these sections:
- [ ] Test Steps (1-8)
- [ ] Performance Checks
- [ ] Quick Verification

---

**Total Time:** ~5 minutes  
**Difficulty:** Easy  
**Success Rate:** Should be 100% for happy path  
**Next:** Deploy to production after verification ✅
