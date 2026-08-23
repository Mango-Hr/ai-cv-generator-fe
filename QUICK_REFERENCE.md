# Quick Reference Guide

## 🚀 Quick Start: Using the Chat Component

### Client Side
```jsx
import Chat from '../components/Chat'

export default function SubmissionDetail() {
  const { submissionId } = useParams()
  const { accessToken } = useSubmissionState()

  return (
    <div style={{ height: '600px' }}>
      <Chat submissionId={submissionId} accessToken={accessToken} userName="You" />
    </div>
  )
}
```

### Admin Side
```jsx
import Chat from '../components/Chat'

export default function SubmissionDetail() {
  const { submissionId } = useParams()
  const { token } = useAuth()

  return (
    <div style={{ height: '600px' }}>
      <Chat submissionId={submissionId} jwtToken={token} staffName="Support" />
    </div>
  )
}
```

---

## 📁 Files Overview

```
Main App & Admin App (Both have same structure)
│
├── src/
│   ├── services/
│   │   └── chatService.js          ← WebSocket + REST API
│   │
│   └── components/
│       └── Chat/
│           ├── Chat.jsx            ← Main component
│           ├── Chat.css            ← Styling
│           └── index.js            ← Export
│
├── server.js                        ← Enhanced Express server
├── render.yaml                      ← Render deployment config
│
└── Documentation/
    ├── CHAT_INTEGRATION_GUIDE.md
    ├── CHAT_SUMMARY.md
    ├── SESSION_COMPLETION_SUMMARY.md
    └── QUICK_REFERENCE.md           ← You are here
```

---

## 🎯 What Each Service Method Does

```javascript
// Connection
chatService.connect(submissionId, accessToken)           // Start WebSocket
chatService.disconnect()                                 // Close connection

// Messages
chatService.sendMessage(id, token, text, files)         // Send with files
chatService.editMessage(id, msgId, token, text)         // Edit message
chatService.deleteMessage(id, msgId, token)             // Delete message
chatService.fetchMessages(id, token)                     // Get history
chatService.markMessagesAsRead(id, token)               // Mark as read

// User Feedback
chatService.sendTypingIndicator(isTyping)               // Show user is typing

// Subscriptions
chatService.onMessage(callback)                         // Listen for events
chatService.onConnectionChange(callback)                // Listen for connection changes

// Status
chatService.isConnected()                               // Check if connected
```

---

## 📊 Component Props

### Client Chat
```jsx
<Chat 
  submissionId={string}    // Required: from URL params
  accessToken={string}     // Required: from login response
  userName={string}        // Optional: default "You"
/>
```

### Admin Chat
```jsx
<Chat 
  submissionId={string}    // Required: from URL params
  jwtToken={string}        // Required: from auth context
  staffName={string}       // Optional: default "Support"
/>
```

---

## 🔌 WebSocket Events Flow

```
┌─ Client App ─────────┐              ┌─ Backend ─────┐              ┌─ Admin App ───────┐
│                      │              │               │              │                   │
│ Sends Message ──────────────────────► Store ─────────────────────► Display Message    │
│                      │              │               │              │                   │
│ Typing (debounce) ──────────────────► Broadcast ────────────────► Show "typing..."   │
│                      │              │               │              │                   │
│ Receives WebSocket Event ◄─────────── Send Event ◄──────────────── Send Message       │
│                      │              │               │              │                   │
│ Auto-reconnect ──────────────────────► Connect ─────────────────► (both ways)        │
│                      │              │               │              │                   │
└──────────────────────┘              └───────────────┘              └───────────────────┘
```

---

## 🛠️ Render Deployment Setup

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
```
NODE_ENV=production
VITE_API_BASE_URL=https://ai-cv-generator-be-production.up.railway.app
```

---

## ✨ Key Features at a Glance

| Feature | How It Works | Status |
|---------|-------------|--------|
| **Real-time Messages** | WebSocket connection | ✅ |
| **File Upload** | FormData + multipart API | ✅ |
| **Typing Indicator** | Debounced (1.5s) typing events | ✅ |
| **Read Receipts** | User reads message → broadcast | ✅ |
| **Auto-reconnect** | Exponential backoff, max 30s | ✅ |
| **Timestamps** | Relative time (2h ago) | ✅ |
| **Avatars** | User initials, color-coded | ✅ |
| **Mobile Support** | Fully responsive design | ✅ |
| **Error Handling** | Inline error display | ✅ |

---

## 🔐 Authentication Flow

### Client
```
1. User submits CV form
2. Backend returns { access_token, submission_id }
3. Store both locally
4. Pass accessToken to Chat component
5. Chat uses it for REST + WebSocket
```

### Admin
```
1. User logs in
2. Auth service stores JWT
3. Pass JWT to Chat component
4. Chat uses it for REST + WebSocket
```

---

## 🧪 Testing Checklist (5 mins)

- [ ] Chat loads without errors
- [ ] WebSocket connects (check status indicator)
- [ ] Type message and send
- [ ] See message appear
- [ ] Typing indicator works
- [ ] Upload file with message
- [ ] See file attachment in message

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Chat won't load | Check console for errors, verify submissionId + token |
| Messages don't appear | Check WebSocket connected indicator, verify API URL |
| Can't send file | Check file size, verify backend accepts uploads |
| Typing indicator stuck | Refresh page (1.5s timeout should clear it) |
| Disconnected frequently | Check network, verify backend is running |

---

## 📱 Responsive Breakpoints

```css
Desktop: 70% width
Tablet: 80% width  
Mobile: 85% width (full width - 10px padding)
```

---

## 🎨 Theming with CSS Variables

Edit in your global CSS or wrap component:

```css
:root {
  --color-deco-blue: #3b82f6;      /* Client messages */
  --color-deco-orange: #ff9800;    /* Admin messages */
  --color-bg: #ffffff;             /* Background */
  --color-border: #e5e5e5;         /* Borders */
  --color-text-primary: #1a1a1a;   /* Main text */
}
```

---

## 🔗 Important URLs

```
API Base: https://ai-cv-generator-be-production.up.railway.app
Main App: https://ai-cv-generator.onrender.com
Admin App: https://admin-ai-cv-generator.onrender.com

WebSocket (Client):
ws://api-host/api/v1/public/submissions/{id}/ws?token={token}

WebSocket (Admin):
ws://api-host/api/v1/admin/submissions/{id}/ws?token={token}
```

---

## 📞 Debug Commands

### Check WebSocket in Console
```javascript
// See connection status
console.log(chatService.isConnected())

// Manually send ping
chatService.sendPing()

// View message listeners
console.log(chatService.messageListeners)
```

### Browser DevTools
- **Network → WS:** See WebSocket messages
- **Console:** Look for connection logs
- **Application → LocalStorage:** Check tokens
- **DevTools → Sources:** Set breakpoints

---

## 🎯 Integration Steps (Checklist)

1. **[ ] Import Component**
   ```jsx
   import Chat from '../components/Chat'
   ```

2. **[ ] Get Props**
   - Extract submissionId from URL
   - Get token from state/context

3. **[ ] Add JSX**
   ```jsx
   <div style={{ height: '600px' }}>
     <Chat {...props} />
   </div>
   ```

4. **[ ] Test Locally**
   - npm run dev
   - Open chat
   - Send test message

5. **[ ] Deploy**
   - git commit + push
   - Render auto-deploys
   - Test on production

---

## 📊 Performance Tips

- Keep Chat height reasonable (400-800px)
- Don't open multiple chats simultaneously
- Clear browser cache if issues persist
- Use connection indicator for debugging
- Check Network tab for slow API calls

---

## 🆘 Need Help?

Check these files in order:
1. **CHAT_INTEGRATION_GUIDE.md** - Detailed integration
2. **CHAT_SUMMARY.md** - Feature overview
3. **SESSION_COMPLETION_SUMMARY.md** - What was built
4. **QUICK_REFERENCE.md** - This file

---

**Last Updated:** August 23, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
