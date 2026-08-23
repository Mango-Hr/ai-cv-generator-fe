# Testing Guide - Auto-Fill Feature

## Quick Testing with Auto-Fill

### What's New
Two new buttons in the Resume form header make testing faster:
- **📋 Auto-fill** - Fills entire form with sample data
- **🗑️ Clear** - Resets form to empty state

### How to Use

#### 1. Quick Test (30 seconds)
```
1. Go to "Build Your Resume" page
2. Click "📋 Auto-fill" button (top-right)
3. Form fills with sample data
4. Page jumps to Review step
5. Click "Submit Resume" to test backend connection
6. Check console for the payload being sent
```

#### 2. Manual Test (Step-by-step)
```
1. Click "📋 Auto-fill"
2. Click "< Previous" to go back through steps
3. Verify all data is correct
4. Make small edits to test individual field validation
5. Click "Next" to verify validation works
```

#### 3. Clear and Start Fresh
```
1. Click "🗑️ Clear" button
2. Form resets to empty
3. Manually fill to test validation
4. Try submitting with incomplete data
5. Verify error messages appear
```

---

## Sample Data Included

Auto-fill provides a complete professional resume:

### Personal Info
- **Name:** John Doe
- **Email:** john.doe@example.com
- **Phone:** +1-555-123-4567

### Job Target
- **Position:** Senior React Developer
- **Company:** Google
- **Priority:** High
- **Description:** Full job posting about React development

### Work Experience (2 entries)
1. **Google** - Senior Software Engineer (2021-present)
   - Led team of 5 engineers, built component library
   - Improved performance by 40%
   
2. **Facebook** - Software Engineer (2019-2021)
   - Built Messenger features with React
   - Mentored 2 junior engineers

### Education
- **MIT** - BS Computer Science (2015-2019)
- Includes relevant coursework

### Skills (12 total)
JavaScript, TypeScript, React, Redux, Node.js, PostgreSQL, MongoDB, AWS, Docker, Git, REST APIs, GraphQL

### Certifications
- AWS Solutions Architect Professional (2022-2025)

### Additional
- Custom notes about availability and preferences

---

## Testing Scenarios

### Test 1: Full Submission Flow
```
1. Click "📋 Auto-fill"
2. Click "Submit Resume"
3. Check console for payload
4. Verify backend response (should see submission_id)
5. Confirm redirect to success page
```

### Test 2: Validation Testing
```
1. Click "📋 Auto-fill"
2. Go to Personal Info step
3. Clear the email field
4. Try to go to next step
5. Verify error message appears
6. Fix email
7. Proceed normally
```

### Test 3: Data Integrity
```
1. Click "📋 Auto-fill"
2. Go back through all steps
3. Verify no data was lost
4. Check that all arrays (experience, education, skills) are populated
5. Verify certifications appear in review
```

### Test 4: Backend Format
```
1. Click "📋 Auto-fill"
2. Open DevTools (F12)
3. Go to Console tab
4. Click "Submit Resume"
5. Look for: "Submission payload: { first_name: ... }"
6. Verify format matches backend schema:
   - first_name, last_name (not firstName, lastName)
   - target_position, target_company (snake_case)
   - raw_data contains: education, experience, skills, certifications
   - Each education has: institution, degree, field_of_study, start_date, end_date, description
   - Each experience has: company, role, start_date, end_date, description
```

---

## Debugging with Console

After auto-filling and submitting:

```javascript
// You'll see these logs in Console:
Making submission request to: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions
API_BASE_URL: https://ai-cv-generator-be-production.up.railway.app
Submission payload: {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  ...
}
Response status: 200
Submission successful: {
  status: "success",
  submission_id: "...",
  access_token: "..."
}
```

---

## Common Test Cases

### ✅ Success Case
1. Auto-fill form
2. Submit without changes
3. Expected: Success, redirect to chat page with submission data

### ❌ Validation Failures (Intentional)
1. Auto-fill form
2. Clear required field (first_name)
3. Try to proceed
4. Expected: Error message "First name is required"

### ⚠️ Backend Errors
1. Auto-fill form
2. Submit with bad email format
3. Expected: Backend validation error

### 🔄 Roundtrip Testing
1. Auto-fill form
2. Manually add a skill
3. Remove a skill
4. Edit job description
5. Submit
6. Verify changes are in payload

---

## Tips for Efficient Testing

1. **Use Auto-fill first** to confirm happy path works
2. **Then test edge cases** (empty fields, special characters)
3. **Check console logs** before reporting bugs
4. **Verify all data fields** match backend schema
5. **Test on both localhost and production URL**

---

## Environment Testing

### Local Development
```bash
npm run dev
# Frontend: http://localhost:5174
# Backend: https://ai-cv-generator-be-production.up.railway.app
# Click Auto-fill → Submit → Check console logs
```

### Production Build
```bash
npm run build
# Deploy to Render
# Test the deployment with auto-fill
# Verify CORS headers are present
```

---

## Reporting Issues

When reporting a bug, include:
1. **Steps to reproduce** (did you use auto-fill?)
2. **Console logs** (F12 → Console tab)
3. **Payload sent** (show the "Submission payload" log)
4. **Backend response** (show the error)
5. **Environment** (localhost vs production)

---

## Auto-Fill Data Structure

The sample data is in `SAMPLE_DATA` constant in `src/pages/SubmitCV.jsx`:

```javascript
const SAMPLE_DATA = {
  formData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    // ... all other fields
    experiences: [
      {
        company: 'Google',
        role: 'Senior Software Engineer',
        startDate: '2021-06-01',
        endDate: '',
        description: '...',
        id: 1,
      },
      // ... more experiences
    ],
    // ... education, skills, certifications
  }
}
```

You can modify this data in the code if you want to test with different sample information.

---

## Troubleshooting

### "Auto-fill button doesn't work"
- Refresh the page (Ctrl+R)
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12)

### "Form didn't fill completely"
- Check if all fields are populated by clicking through steps
- Look for validation errors in the form
- Check console for error messages

### "Submit still fails after auto-fill"
- Check backend is running (see console logs for URL)
- Verify CORS headers are enabled on backend
- Check network tab (F12 → Network → see the POST request)

---

## Next Steps

Once auto-fill works:
1. ✅ Test backend connectivity
2. ✅ Verify payload format
3. ✅ Test chat integration
4. ✅ Deploy to production
5. ✅ Verify end-to-end flow

Enjoy faster testing! 🚀
