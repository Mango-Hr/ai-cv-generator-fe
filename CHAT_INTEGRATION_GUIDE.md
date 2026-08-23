# WebSocket Chat Integration Guide

## Overview
The chat system is fully implemented with WebSocket support for real-time messaging on both client and admin sides. This guide explains how to integrate the Chat component into your SubmissionDetail pages.

## 📁 What Was Created

### Services
- **`src/services/chatService.js`** - Handles WebSocket connections, REST API calls, and message management
  - Connection management with automatic reconnection
  - Message sending, editing, deleting
  - File upload support
  - Typing indicators and read receipts

### Components
- **`src/components/Chat/Chat.jsx`** - Full-featured chat component
  - Message display with avatars and timestamps
  - Real-time typing indicators
  - File attachment support
  - Auto-scroll to latest messages
  - Connection status indicator
  - Error handling and recovery

### Styling
- **`src/components/Chat/Chat.css`** - Complete chat UI styling with responsive design

## 🚀 Integration Steps

### Step 1: Import Chat Component

In your SubmissionDetail page (client-side):
```jsx
import Chat from '../components/Chat'
```

In your admin SubmissionDetail page:
```jsx
import Chat from '../components/Chat'
```

### Step 2: Add Chat to Your Layout

**Client Side (e.g., `src/pages/SubmissionDetail.jsx`):**
```jsx
export default function SubmissionDetail() {
  const { submissionId } = useParams()
  const { accessToken } = useSubmissionState() // Get from your state/context
  const [userName, setUserName] = useState('You')

  return (
    <div className="submission-detail">
      {/* Your existing content */}
      
      {/* Add Chat Component */}
      <div style={{ height: '600px', marginTop: '2rem' }}>
        <Chat 
          submissionId={submissionId}
          accessToken={accessToken}
          userName={userName}
        />
      </div>
    </div>
  )
}
```

**Admin Side (e.g., `src/pages/SubmissionDetail.jsx`):**
```jsx
export default function SubmissionDetail() {
  const { submissionId } = useParams()
  const { jwtToken } = useAuthContext() // Get JWT from auth context
  const [staffName, setStaffName] = useState('Support')

  return (
    <div className="submission-detail">
      {/* Your existing content */}
      
      {/* Add Chat Component */}
      <div style={{ height: '600px', marginTop: '2rem' }}>
        <Chat 
          submissionId={submissionId}
          jwtToken={jwtToken}
          staffName={staffName}
        />
      </div>
    </div>
  )
}
```

### Step 3: CSS Integration

The Chat component uses CSS custom properties. Ensure your app has these variables defined in your global CSS:

```css
:root {
  /* Colors */
  --color-bg: #ffffff;
  --color-bg-secondary: #f9f9f9;
  --color-border: #e5e5e5;
  --color-border-light: #f0f0f0;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-deco-blue: #3b82f6;
  --color-deco-orange: #ff9800;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-accent-subtle: rgba(59, 130, 246, 0.1);

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  --text-4xl: 36px;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
}
```

## 📋 Component Props

### Client Chat Component
```jsx
<Chat
  submissionId={string}      // Required: The submission ID
  accessToken={string}       // Required: Client access token
  userName={string}          // Optional: Display name (default: "You")
/>
```

### Admin Chat Component
```jsx
<Chat
  submissionId={string}      // Required: The submission ID
  jwtToken={string}          // Required: Admin JWT token
  staffName={string}         // Optional: Display name (default: "Support")
/>
```

## 🔧 Advanced Usage

### Getting Access Tokens

**Client Side:**
After submitting the CV form and getting a response:
```jsx
const response = await submissionService.createSubmission(data)
const accessToken = response.access_token // Store this
const submissionId = response.submission_id // Store this
```

**Admin Side:**
Get JWT from your authentication context:
```jsx
const { token: jwtToken } = useAuthContext()
```

### Manual Message Management

If you need to interact with the chat service directly:

```jsx
import chatService from '../services/chatService'

// Connect
await chatService.connect(submissionId, accessToken)

// Send message
await chatService.sendMessage(submissionId, accessToken, 'Hello', files)

// Fetch history
const messages = await chatService.fetchMessages(submissionId, accessToken)

// Listen to events
chatService.onMessage((message) => {
  console.log('New event:', message)
})

// Disconnect
chatService.disconnect()
```

## 🔌 WebSocket Connection Details

### Connection URLs
- **Client:** `ws://api-host/api/v1/public/submissions/{submissionId}/ws?token={accessToken}`
- **Admin:** `ws://api-host/api/v1/admin/submissions/{submissionId}/ws?token={jwtToken}`

### Automatic Features
- ✅ Ping/pong keep-alive every 45 seconds
- ✅ Exponential backoff reconnection (max 5 attempts)
- ✅ Automatic auth failure detection
- ✅ Graceful connection close handling

### Events Handled
- `new_message` - New message received
- `message_updated` - Message edited
- `message_deleted` - Message deleted
- `typing` - User typing indicator
- `read_receipt` - Messages marked as read
- `submission_status_changed` - Status update
- `submission_assigned` - Staff assignment change

## 🎨 Customization

### Change Colors
Modify the component by updating CSS variables in your app's root or specific container:

```css
.custom-chat {
  --color-deco-blue: #your-color;
  --color-deco-orange: #your-color;
}
```

Then wrap the Chat component:
```jsx
<div className="custom-chat">
  <Chat {...props} />
</div>
```

### Adjust Chat Height
Set inline style on the container:
```jsx
<div style={{ height: '500px' }}>
  <Chat {...props} />
</div>
```

### Add Custom Avatar
Extend the Chat component to customize avatars:
```jsx
function CustomChat(props) {
  return <Chat {...props} />
}
```

## 🚨 Error Handling

The Chat component displays errors inline. Common errors:
- "Failed to connect to chat" - WebSocket connection failed
- "Authentication failed" - Invalid token
- "Failed to send message" - API error
- "Failed to reconnect" - Reconnection attempts exhausted

Errors are shown in a red banner above the input area.

## 📱 Responsive Design

The chat component is fully responsive:
- Desktop: 70% width messages
- Mobile: 85% width messages
- Auto-wrapping on small screens
- Touch-friendly file upload button

## 🔐 Security Considerations

1. **Token Storage**: Store access tokens securely
2. **Token Expiration**: Implement token refresh logic
3. **File Uploads**: Backend should validate file types/sizes
4. **Message Validation**: Backend validates all messages
5. **CORS**: Ensure WebSocket CORS is properly configured

## 🧪 Testing Checklist

- [ ] Connect to chat successfully
- [ ] Send message and see it appear
- [ ] Receive message from other user
- [ ] Upload file with message
- [ ] See typing indicator
- [ ] View read receipts
- [ ] Test reconnection (close tab, reopen)
- [ ] Verify message timestamps
- [ ] Test on mobile view
- [ ] Verify error states

## 📚 API Endpoints

All endpoints are handled by the chatService:

### REST Endpoints
- `GET /api/v1/public/submissions/{submissionId}/messages` - Fetch history
- `POST /api/v1/public/submissions/{submissionId}/messages` - Send message
- `PATCH /api/v1/public/submissions/{submissionId}/messages/{messageId}` - Edit
- `DELETE /api/v1/public/submissions/{submissionId}/messages/{messageId}` - Delete
- `PATCH /api/v1/public/submissions/{submissionId}/messages/read` - Mark as read

### Admin REST Endpoints
- `GET /api/v1/admin/submissions/{submissionId}/messages` - Fetch history
- `POST /api/v1/admin/submissions/{submissionId}/messages` - Send message
- `PATCH /api/v1/admin/submissions/{submissionId}/messages/{messageId}` - Edit
- `DELETE /api/v1/admin/submissions/{submissionId}/messages/{messageId}` - Delete
- `PATCH /api/v1/admin/submissions/{submissionId}/messages/read` - Mark as read

## 🆘 Troubleshooting

### Chat not connecting
1. Check WebSocket URL in browser console
2. Verify access token is valid
3. Check browser DevTools → Network → WS tab
4. Verify backend is running and accessible

### Messages not appearing
1. Check browser console for errors
2. Verify message was sent successfully
3. Check WebSocket connection status indicator
4. Try refreshing the page

### File upload not working
1. Ensure backend accepts file uploads
2. Check file size limits
3. Verify files are selected before sending
4. Check CORS headers for file upload endpoint

### Typing indicator not working
1. Verify typing events are being sent (check Network tab)
2. Check for JavaScript errors in console
3. Ensure debounce timeout is set (1500ms)

## 📞 Support

For issues or questions, check:
1. Browser console for detailed error messages
2. Network tab to inspect WebSocket frames
3. Backend logs for server-side issues
4. Verify environment variables are set correctly
