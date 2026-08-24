# Session Persistence & Navigation Guide

## Problem Statement

Current behavior:
- User submits resume form → Gets chat access
- User refreshes page → What happens?
- User wants to fill a different form → What about previous form's chat?

**Question:** How do we preserve user sessions and allow access to previous forms/chats?

---

## Current State (Before Implementation)

### What's Currently Stored

```javascript
// When form is submitted
localStorage.setItem(`submission_${submissionId}`, JSON.stringify({
  access_token: "06a8b794-dcbe-...",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com"
}))
```

### Current Issues

1. **Refresh on chat page** → Chat loads fine (data in localStorage)
2. **Refresh on form page** → Form resets (state lost, but localStorage has data)
3. **Start new form** → Previous form data still in localStorage (good) but user can't easily access it
4. **Direct URL access** → Can only access if you have the exact submission_id in URL

---

## Recommended Solutions

### **Option 1: Simple Recovery Page (Recommended for MVP)**

**Complexity:** Low  
**User Impact:** Medium  
**Implementation Time:** 1-2 hours

#### How It Works

Create a **Recovery Page** that shows:
1. All previous submissions from localStorage
2. Quick access to resume a form
3. Quick access to chat for completed submissions

```
┌─────────────────────────────────────┐
│         Your Submissions             │
├─────────────────────────────────────┤
│                                     │
│  Submission #1                      │
│  John Doe | john@example.com        │
│  Status: Draft                      │
│  [Resume Form] [View Chat]          │
│                                     │
│  Submission #2                      │
│  John Doe | john@example.com        │
│  Status: Completed                  │
│  [View Chat] [Download Resume]      │
│                                     │
│  [+ Create New Resume]              │
│                                     │
└─────────────────────────────────────┘
```

#### Implementation Steps

1. **Create new page:** `/src/pages/MySubmissions.jsx`
2. **Read all localStorage keys** matching `submission_*`
3. **Display as list** with submission details
4. **Add links** to:
   - Resume form (to continue editing)
   - Chat page (to continue conversation)
   - Download generated resume (if available)

#### Storage Structure

```javascript
// Multiple submissions can be stored
localStorage.getItem('submission_06a8b794-de7a-...')
localStorage.getItem('submission_12345678-abcd-...')
localStorage.getItem('submission_87654321-wxyz-...')

// Each contains:
{
  access_token: "...",
  first_name: "...",
  last_name: "...",
  email: "...",
  submission_id: "...",  // ADD THIS for recovery
  created_at: "2026-08-23T...",  // ADD THIS for sorting
  status: "draft" | "completed"  // ADD THIS for status
}
```

#### Route Addition

```
GET / → Landing page
GET /submit → New form
GET /submit/:id → Edit existing form (resume old form data)
GET /chat/:id → Chat for submission
GET /my-submissions → Recovery page (NEW)
```

#### Navigation Flow

```
Home Page
  ├─ "Build Your Resume" (New) → /submit
  ├─ "My Submissions" (New) → /my-submissions
  │   └─ List all previous submissions
  │   └─ Click one → /submit/:id (resume)
  │   └─ Click one → /chat/:id (continue chat)
  └─ "Continue" (if exists) → /my-submissions?auto=latest
```

---

### **Option 2: Smart Session Detection (Better UX)**

**Complexity:** Medium  
**User Impact:** High  
**Implementation Time:** 2-3 hours

#### How It Works

When user arrives at `/submit` page:

```javascript
// Check for previous sessions
const previousSubmissions = getPreviousSubmissions()

if (previousSubmissions.length > 0) {
  // Show modal: "Continue where you left off?"
  showModal({
    title: "Welcome back!",
    message: `You have ${previousSubmissions.length} submission(s) in progress`,
    buttons: [
      { label: "Continue Latest", action: () => resumeSubmission(latest) },
      { label: "View All", action: () => navigate("/my-submissions") },
      { label: "Start New", action: () => clearAndStartNew() }
    ]
  })
} else {
  // New user, show fresh form
  showEmptyForm()
}
```

#### Implementation Steps

1. **Create hook:** `useSubmissionHistory()`
   - Get all submissions from localStorage
   - Sort by `created_at` (newest first)
   - Filter by status
   - Return methods to resume/delete

2. **Modify SubmitCV.jsx:**
   - Check for previous submissions on mount
   - Show modal with options
   - Pre-fill form if resuming
   - Allow clearing history

3. **Add persistence:**
   - Save form draft while typing (auto-save every 30s)
   - Include timestamp for sorting
   - Track form completion percentage

#### Storage Structure

```javascript
{
  submission_id: "06a8b794-de7a-...",
  access_token: "06a8b794-dcbe-...",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  
  // ADD for recovery
  created_at: "2026-08-23T10:30:00Z",
  last_updated: "2026-08-23T14:45:00Z",
  status: "draft",  // or "submitted", "completed"
  
  // ADD for form recovery
  form_data: {
    personal: { firstName, lastName, email, phone },
    job_target: { targetPosition, targetCompany, ... },
    experience: [...],
    education: [...]
  }
}
```

#### Route Addition

```
GET / → Landing page
  ├─ if has previous submissions:
  │   └─ Show "Continue Latest" button
  │   └─ Show "View All" link
  └─ Always show "Start New"

GET /submit
  ├─ Check localStorage
  ├─ Show modal if previous exists
  └─ Render form

GET /submit/:id (NEW)
  ├─ Load submission data
  ├─ Pre-fill form
  └─ Continue editing
```

---

### **Option 3: Full History Dashboard (Best UX)**

**Complexity:** High  
**User Impact:** Highest  
**Implementation Time:** 4-6 hours

#### How It Works

Complete submission management system:

```
┌───────────────────────────────────────────────────┐
│           My Resume Dashboard                    │
├───────────────────────────────────────────────────┤
│                                                   │
│ [New Resume]                                      │
│                                                   │
│ ┌────────────────────────────────────────────┐   │
│ │ Resume #1: Senior React Developer          │   │
│ │ john.doe@example.com                       │   │
│ │ Status: ▶ In Progress (45%)                │   │
│ │ Last updated: 2 hours ago                  │   │
│ │ [Continue] [View Chat] [Delete] [Download]│   │
│ └────────────────────────────────────────────┘   │
│                                                   │
│ ┌────────────────────────────────────────────┐   │
│ │ Resume #2: Software Engineer               │   │
│ │ john.doe@example.com                       │   │
│ │ Status: ✓ Completed                        │   │
│ │ Submitted: 5 days ago                      │   │
│ │ [View Chat] [Download] [Restart] [Delete]  │   │
│ └────────────────────────────────────────────┘   │
│                                                   │
│ ┌────────────────────────────────────────────┐   │
│ │ Resume #3: Full-Stack Engineer             │   │
│ │ john.doe@example.com                       │   │
│ │ Status: ✗ Draft (abandoned)                │   │
│ │ Last updated: 3 weeks ago                  │   │
│ │ [Resume] [Delete]                          │   │
│ └────────────────────────────────────────────┘   │
│                                                   │
└───────────────────────────────────────────────────┘
```

#### Features

- **Dashboard page** showing all submissions
- **Status tracking** (draft, submitted, completed)
- **Form recovery** (resume partially-filled forms)
- **Chat history** (access previous conversations)
- **Resume download** (if backend generates)
- **Form restart** (restart with same job target)
- **Delete submission** (clean up old submissions)
- **Auto-save** (form saved while typing)
- **Search/filter** (find submissions)
- **Sorting** (by date, status, job title)

#### Implementation Steps

1. **Create Dashboard component:** `/src/pages/Dashboard.jsx`
2. **Create submission model:** Handle all data across localStorage
3. **Add persistence layer:** Hooks for submission management
4. **Implement auto-save:** Save form state every 30 seconds
5. **Add metadata:** Track timestamps, status, progress
6. **Navigation update:** Central hub for all submissions

#### Storage Structure

```javascript
{
  submission_id: "06a8b794-de7a-...",
  access_token: "06a8b794-dcbe-...",
  
  // User info
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  
  // Timestamps
  created_at: "2026-08-23T10:30:00Z",
  last_updated: "2026-08-23T14:45:00Z",
  submitted_at: "2026-08-23T16:00:00Z",  // When form was submitted
  
  // Status
  status: "draft" | "submitted" | "completed",
  completion_percentage: 45,  // How much form is filled
  
  // Complete form data (for recovery)
  form_data: {
    personal: { firstName, lastName, email, phone },
    job_target: { targetPosition, targetCompany, jobDescription, ... },
    experience: [{ company, role, ... }, ...],
    education: [{ institution, degree, ... }, ...],
    skills: [list],
    certifications: [...]
  },
  
  // Chat/Backend info
  messages: [...]  // Cache recent messages
}
```

---

## Comparison Table

| Feature | Option 1 | Option 2 | Option 3 |
|---------|----------|----------|----------|
| **Recovery after refresh** | ✅ | ✅ | ✅ |
| **Multiple submissions** | ✅ | ✅ | ✅ |
| **Resume old form** | ✅ | ✅ | ✅ |
| **Access previous chat** | ✅ | ✅ | ✅ |
| **Smart modal** | ❌ | ✅ | ✅ |
| **Auto-save** | ❌ | ❌ | ✅ |
| **Dashboard** | ✅ | ✅ | ✅ |
| **Form progress** | ❌ | ✅ | ✅ |
| **Sorting/filtering** | Basic | Medium | Advanced |
| **Time to implement** | 1-2h | 2-3h | 4-6h |
| **Recommended** | MVP | Growth | Production |

---

## Implementation Priority

### Phase 1: MVP (Minimum Viable Product)
**Goal:** Basic session persistence

```javascript
// Just store what we have
localStorage.setItem(`submission_${id}`, JSON.stringify({
  access_token,
  first_name,
  last_name,
  email,
  created_at
}))
```

- Users can refresh chat and still access it
- Previous submissions accessible via direct URL
- No special recovery page

### Phase 2: Growth (User-Friendly)
**Goal:** Easy session recovery

```
Add /my-submissions page
Show list of previous submissions
One-click access to any submission
Smart modal on form page
```

### Phase 3: Production (Enterprise-Grade)
**Goal:** Full submission management

```
Complete dashboard
Auto-save while typing
Form progress tracking
Download resumes
Search/filter submissions
Advanced analytics
```

---

## Technical Considerations

### localStorage Limitations

```javascript
// localStorage max size: ~5-10MB per domain
// Each submission: ~50-100KB
// Safe estimate: 50-100 submissions

// Cleanup strategy:
if (Object.keys(localStorage).length > 50) {
  // Delete oldest submission
  const oldest = findOldestSubmission()
  localStorage.removeItem(`submission_${oldest.id}`)
}
```

### Refresh Behavior

```javascript
// Current: Chat recovers automatically
// Before: User on chat → refresh → chat still loads
// Good ✅

// Form: Currently resets (no auto-save)
// Before: User filling form → refresh → form clears
// Solution: Auto-save form data while typing
```

### Navigation Considerations

```
Current Routes:
  / → Home
  /submit → New form
  /submit/success?id=xxx → Success page
  /chat/:id → Chat

Proposed Routes:
  / → Home (add "Continue" button if submissions exist)
  /submit → New form (show modal if previous exist)
  /submit/:id → Edit existing form (NEW)
  /my-submissions → All submissions (NEW)
  /chat/:id → Chat (unchanged)
```

---

## Recommended Path Forward

### For Your MVP (Next 1-2 weeks)

✅ **Start with Option 1 (Simple Recovery Page)**

1. Create `/my-submissions` page
2. List all `submission_*` keys from localStorage
3. Add links to resume form and chat
4. Add "New Resume" button
5. Optional: Add delete functionality

**Time:** 1-2 hours  
**Impact:** High  
**User value:** Immediate access to all submissions

### After MVP (Week 3-4)

✅ **Move to Option 2 (Smart Recovery)**

1. Add modal on `/submit` page
2. Implement auto-save while typing
3. Add form progress indicator
4. Add "Continue Latest" shortcut

**Time:** 2-3 hours  
**Impact:** Higher  
**User value:** Better UX, less re-filling

### Production Ready (Month 2+)

✅ **Full Option 3 (Dashboard)**

1. Build complete dashboard
2. Add advanced features (sorting, filtering)
3. Implement resume downloads
4. Add analytics

**Time:** 4-6 hours  
**Impact:** Highest  
**User value:** Professional submission management

---

## Code Structure Example (Option 1)

### File: `/src/pages/MySubmissions.jsx`

```javascript
// Get all submissions from localStorage
const submissions = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key.startsWith('submission_')) {
    const data = JSON.parse(localStorage.getItem(key))
    submissions.push({
      id: key.replace('submission_', ''),
      ...data
    })
  }
}

// Display as cards
return (
  <div className="submissions-list">
    {submissions.map(sub => (
      <div key={sub.id} className="submission-card">
        <h3>{sub.first_name} {sub.last_name}</h3>
        <p>{sub.email}</p>
        <button onClick={() => navigate(`/chat/${sub.id}`)}>
          View Chat
        </button>
        <button onClick={() => navigate(`/submit?resume=${sub.id}`)}>
          Resume Form
        </button>
      </div>
    ))}
  </div>
)
```

---

## Summary

| Requirement | Solution |
|-----------|----------|
| **Refresh chat** → Chat still accessible | ✅ Already works (data in localStorage) |
| **Refresh form** → Form lost | ⚠️ Add auto-save (Option 2/3) |
| **Access previous chat** | ✅ Option 1: Create recovery page |
| **Resume old form** | ⚠️ Option 2/3: Load from localStorage |
| **Multiple submissions** | ✅ Already supported (multiple keys) |
| **Easy navigation** | ⚠️ Option 1+: Add recovery page + routes |

**Recommended:** Implement Option 1 now (1-2 hours), then upgrade to Option 2 later (2-3 hours).

---

## Questions for Your Team

1. Do you want auto-save while filling form?
2. How many concurrent submissions should one user have?
3. Should users be able to restart a completed submission?
4. Should form data be cleared after X days of inactivity?
5. Do you want to sync submissions to backend (database)?

---

**Next Step:** Choose which option fits your timeline and user needs! 🎯
