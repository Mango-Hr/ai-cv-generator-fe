# API Integration Guide

## Overview
The AI CV Generator frontend is now fully integrated with the backend API for CV submissions. This document outlines the integration, configuration, and testing procedures.

## Environment Configuration

### Development Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

### Production Setup
For Render or other production environments, set the environment variable:
```bash
VITE_API_BASE_URL=https://your-backend-api.com
```

## API Integration Details

### Service File: `src/services/submissionService.js`

#### `createSubmission(submissionData)`
- **Endpoint:** `POST /api/v1/public/submissions`
- **Description:** Submit a new CV generation request
- **Parameters:** Submission data object
- **Returns:** Response with submission ID

```javascript
const response = await createSubmission({
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "+1234567890",
  target_position: "Senior Product Manager",
  target_company: "Tech Corp",
  priority: "normal",
  job_description: "...",
  existing_cv_url: "",
  raw_data: {
    education: [...],
    experience: [...],
    skills: [...],
    certifications: [...],
    custom_notes: ""
  }
})
```

#### `getSubmissionStatus(submissionId)`
- **Endpoint:** `GET /api/v1/public/submissions/:id`
- **Description:** Get submission status and details
- **Parameters:** Submission ID
- **Returns:** Submission object with current status

#### `downloadCV(submissionId)`
- **Endpoint:** `GET /api/v1/public/submissions/:id/download`
- **Description:** Download the generated CV as PDF
- **Parameters:** Submission ID
- **Returns:** PDF blob for download

## Form Data Structure

The SubmitCV form collects and transforms data as follows:

### Frontend Form Data
```javascript
{
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  targetPosition: "",
  targetCompany: "",
  jobDescription: "",
  priority: "normal",
  existingCVUrl: "",
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
  customNotes: ""
}
```

### API Request Format (after transformation)
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "user@example.com",
  "phone": "string",
  "target_position": "string",
  "target_company": "string",
  "priority": "normal|high|urgent",
  "job_description": "string",
  "existing_cv_url": "string",
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

## Form Flow

### Step 1: Personal Information
- First Name (required)
- Last Name (required)
- Email (required)
- Phone (optional)

### Step 2: Job Target
- Target Position (required)
- Target Company (optional)
- Priority Level (normal/high/urgent)
- Job Description (optional)
- Existing CV URL (optional)

### Step 3: Work Experience
- Company Name
- Job Title
- Start Date
- End Date
- Description
- Can add multiple entries

### Step 4: Education
- Institution
- Degree
- Field of Study
- Start Date
- End Date
- Description
- Can add multiple entries

### Step 5: Skills & Certifications
- Skills (comma-separated list)
- Certifications (name, organization, dates)
- Additional Information / Custom Notes

### Step 6: Review
- Review all submitted information
- Edit any section
- Submit to API

## Error Handling

The form includes comprehensive error handling:

1. **Network Errors:** Displays user-friendly error messages
2. **Validation Errors:** Pre-submission validation on each step
3. **Server Errors:** Catches API errors and displays them
4. **Loading States:** Disables form during submission

## User Feedback

The integration includes:
- **Toast Notifications:** Success, error, and info messages
- **Loading State:** Visual feedback during submission
- **Disabled State:** Form disables while submitting
- **Redirect:** Success page with submission ID

## Testing the Integration

### Manual Testing Steps

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Submit CV Page**
   - Go to `http://localhost:5174/submit`

3. **Fill in Form**
   - Complete all steps of the form
   - Add at least one experience and education entry

4. **Submit**
   - Click "Submit CV" button
   - Watch for loading state
   - Expect redirect to success page with submission ID

### Testing Checklist

- [ ] Form validates required fields
- [ ] All steps collect data correctly
- [ ] Data transforms to API format correctly
- [ ] API request is sent with correct payload
- [ ] Success response redirects to success page
- [ ] Error messages display properly
- [ ] Loading state shows during submission
- [ ] Buttons are disabled during submission
- [ ] Toast notifications appear for success/error
- [ ] Environment variable is read correctly

### Network Testing

You can test network requests using:

1. **Browser DevTools (F12)**
   - Network tab shows API requests
   - Check request headers, body, and response

2. **Console Logs**
   - API service logs errors to console
   - Check console for detailed error information

## Production Deployment

### For Render Deployment

1. **Set Environment Variable in Render Dashboard:**
   - Dashboard → Environment → Add Variable
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-api.com`

2. **Redeploy:**
   - Push changes to GitHub
   - Render automatically rebuilds and deploys

### For Other Platforms

Update environment variable according to your platform's documentation:
- AWS: Lambda environment variables
- Vercel: Project settings → Environment Variables
- Netlify: Site settings → Build & Deploy → Environment

## Troubleshooting

### "Failed to connect to API"
- Check `VITE_API_BASE_URL` environment variable
- Verify backend API is running
- Check browser DevTools Network tab for request details

### "CORS Error"
- Backend API must have CORS enabled for frontend domain
- Check backend CORS configuration

### "Invalid request body"
- Check form data matches API schema
- Verify date formats are YYYY-MM-DD
- Ensure required fields are not empty

### "API returns 500 error"
- Check backend logs
- Verify backend database connection
- Check backend request validation

## Next Steps

1. Test the integration with your backend API
2. Verify all form data is collected and transformed correctly
3. Handle any backend-specific validation errors
4. Monitor production deployments
5. Gather user feedback and iterate

## References

- Vite Environment Variables: https://vitejs.dev/guide/env-and-modes.html
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- React Hooks: https://react.dev/reference/react

