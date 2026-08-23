# Chat Integration Flow Guide

## How It Works Now

### 1. User Submits CV Form
User fills out the SubmitCV form and clicks submit.

**What happens:**
- Form data is sent to backend API: `POST /api/v1/public/submissions`
- Backend responds with:
  - `submission_id` - Unique ID for this submission
  - `access_token` - Token for accessing the chat and files
  - Timestamp and other metadata

### 2. Data Stored in Browser
After successful submission:
- Submission data is stored in `localStorage` with key: `submission_{submissionId}`
- Stored data includes:
  ```json
  {
    "access_token": "token-string",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
  ```

### 3. Success Page Shows
User is redirected to `/submit/success?id={submissionId}`
- Displays submission ID
- Shows "What Happens Next" steps
- Has "Open Chat" button

### 4. User Clicks "Open Chat" or Chat in Header
- URL changes to `/chat/{submissionId}`
- ClientChat page loads

### 5. Chat Page Retrieves Data
ClientChat component:
- Reads URL parameter: `submissionId`
- Retrieves from localStorage: `submission_{submissionId}`
- Extracts `access_token` and client name
- Passes these to Chat component

### 6. Chat Connects to Backend
Chat component:
- Uses `submissionId` + `accessToken` to connect to WebSocket
- Fetches message history from backend
- Establishes real-time connection
- Displays messages from backend

---

## User Flow Diagram

```
Submit CV Form
      ↓
API Response (success)
      ↓
Store in localStorage
      ↓
Navigate to Success Page
      ↓
User clicks "Open Chat"
      ↓
Load Chat Page (/chat/{id})
      ↓
Retrieve from localStorage
      ↓
Initialize WebSocket
      ↓
Display Real-Time Chat
```

---

## File Structure

```
src/pages/
├── SubmitCV.jsx          ← Where submission happens & data stored
├── SubmissionSuccess.jsx ← Shows success, has "Open Chat" button
├── ClientChat.jsx        ← Retrieves data & shows Chat component
└── ClientChat.css        ← Styling for chat page

src/components/
└── Chat/
    ├── Chat.jsx          ← Real chat component (backend-connected)
    ├── Chat.css
    └── index.js

src/services/
└── chatService.js        ← WebSocket & REST API handling
```

---

## Key Code Changes

### 1. SubmitCV.jsx - Store Data After Success
```javascript
// After createSubmission API call succeeds:
const submissionId = response.id || response.submission_id
const storedData = {
  access_token: response.access_token,
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: formData.email,
}
localStorage.setItem(`submission_${submissionId}`, JSON.stringify(storedData))
```

### 2. ClientChat.jsx - Retrieve Data
```javascript
useEffect(() => {
  const stored = localStorage.getItem(`submission_${submissionId}`)
  if (stored) {
    const { access_token, first_name, last_name } = JSON.parse(stored)
    setAccessToken(access_token)
    setClientName(`${first_name} ${last_name}`.trim() || 'You')
  }
}, [submissionId])
```

### 3. SubmissionSuccess.jsx - Navigate to Chat
```javascript
const handleGoToChat = () => {
  navigate(`/chat/${submissionId}`)
}
```

---

## Testing the Flow

### Step 1: Fill Out Form
1. Navigate to `http://localhost:5174/submit`
2. Fill out all required fields
3. Complete all 6 steps
4. Click "Submit"

### Step 2: Check Success
1. You should see success page with submission ID
2. Open browser DevTools → Application → LocalStorage
3. Verify key exists: `submission_{submissionId}`
4. Check the stored data has access_token

### Step 3: Open Chat
1. Click "Open Chat" button
2. Should load chat page at `/chat/{submissionId}`
3. Chat should display with connection status indicator

### Step 4: Send Message
1. Type message in chat input
2. Click send or press Enter
3. Message should be sent to backend via REST API
4. Should appear in chat if backend is running

### Step 5: Verify WebSocket
1. Open DevTools → Network → WS tab
2. You should see WebSocket connection:
   - URL: `ws://api-host/api/v1/public/submissions/{id}/ws?token={token}`
   - Status: Connected
   - Periodic ping/pong messages

---

## Troubleshooting

### Chat Won't Load
**Problem:** Chat page shows "Unable to Load Chat"

**Solution:**
1. Check if you submitted the form (submissionId must exist in URL)
2. Open DevTools → LocalStorage → look for `submission_*` key
3. Verify the key matches the submissionId in the URL
4. If data is missing, re-submit the form

### WebSocket Not Connecting
**Problem:** Connection indicator shows "Disconnected"

**Solution:**
1. Check backend is running at `https://ai-cv-generator-be-production.up.railway.app`
2. Verify `VITE_API_BASE_URL` in `.env` is correct
3. Check browser console for errors
4. Check DevTools → Network → WS tab for connection attempts

### Messages Not Appearing
**Problem:** Message sent but doesn't appear in chat

**Solution:**
1. Check connection status indicator is green
2. Look for error message in chat UI
3. Check browser console for API errors
4. Verify backend is storing messages
5. Try refreshing page to reload chat history

### Access Token Invalid
**Problem:** Error about invalid token or authentication failed

**Solution:**
1. The token from `response.access_token` should be saved
2. Verify localStorage has the token:
   ```javascript
   JSON.parse(localStorage.getItem(`submission_{id}`)).access_token
   ```
3. If token is wrong, re-submit the form
4. May need to restart backend service

---

## API Endpoints Used

### Submission Creation (POST)
```
POST /api/v1/public/submissions
Body: { first_name, last_name, email, ... }
Response: { id, access_token, created_at, ... }
```

### WebSocket Connection (WS)
```
ws://api-host/api/v1/public/submissions/{id}/ws?token={token}
Sends/receives: { type: "...", data: { ... } }
```

### Chat Endpoints (REST)
```
GET    /api/v1/public/submissions/{id}/messages
POST   /api/v1/public/submissions/{id}/messages
PATCH  /api/v1/public/submissions/{id}/messages/{msgId}
DELETE /api/v1/public/submissions/{id}/messages/{msgId}
PATCH  /api/v1/public/submissions/{id}/messages/read
```

---

## Environment Variables

```
# .env file
VITE_API_BASE_URL=https://ai-cv-generator-be-production.up.railway.app
```

This must point to your backend API where WebSocket is hosted.

---

## LocalStorage Keys

Keys used by the app:

```
submission_{submissionId} → stores { access_token, first_name, last_name, email }
```

**Example:**
```
Key:   submission_SUB-2024-001
Value: {
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

---

## Next Steps for Users

After CV is submitted:

1. ✅ User can see submission ID on success page
2. ✅ User can open chat immediately
3. ✅ Chat connects to real backend
4. ✅ User can send messages in real-time
5. ✅ Admin can reply and communicate
6. ✅ User receives updates on CV status

---

## Security Notes

- ✅ Access token stored locally (user-scoped)
- ✅ Token sent with WebSocket connection as query param
- ✅ Backend validates token on each message
- ✅ Each submission has unique access token
- ⚠️ Token visible in localStorage (acceptable for client tokens)
- ⚠️ Consider using sessionStorage for more security if needed

---

**Status:** ✅ Production Ready - Chat is now fully integrated with backend!
