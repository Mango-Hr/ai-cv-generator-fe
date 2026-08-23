# Resume Form Filling Guide

## Backend Schema vs Form Fields

The backend expects the following data structure. Here's how to fill each field:

---

## **Step 1: Personal Information**

### Required Fields

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| First Name | `first_name` | String | "John" | Non-empty, letters only |
| Last Name | `last_name` | String | "Doe" | Non-empty, letters only |
| Email | `email` | String | "john@example.com" | Valid email format |

### Optional Fields

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Phone | `phone` | String | "+1-555-123-4567" or "5551234567" |

---

## **Step 2: Job Target**

### Required Fields

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| Target Position | `target_position` | String | "Senior React Developer" | Non-empty |
| Job Description | `job_description` | String | "5+ years React experience..." | Non-empty, paste the job posting here |

### Optional Fields

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Target Company | `target_company` | String | "Google" |
| Priority | `priority` | String | "normal", "high", or "urgent" |
| Existing CV URL | `existing_cv_url` | String (URL) | "https://example.com/resume.pdf" |

---

## **Step 3: Work Experience**

### Required (Add at least 1)

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| Company | `company` | String | "Google" | Non-empty |
| Job Title | `role` | String | "Senior Engineer" | Non-empty |
| Start Date | `start_date` | String (ISO format) | "2020-01-15" or "01/15/2020" | Non-empty |
| Description | `description` | String | "Led team of 5 engineers..." | Non-empty, describe your responsibilities |

### Optional

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| End Date | `end_date` | String | "2024-06-30" or leave blank if current job |

**Date Format:** Any standard format works:
- `2024-06-30` (YYYY-MM-DD) ✅
- `06/30/2024` (MM/DD/YYYY) ✅
- `30-06-2024` (DD-MM-YYYY) ✅

---

## **Step 4: Education**

### Required (Add at least 1)

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| Institution | `institution` | String | "MIT" or "Massachusetts Institute of Technology" | Non-empty |
| Degree | `degree` | String | "BS", "BA", "MS", "PhD", "Associate" | Non-empty |
| Start Date | `start_date` | String (ISO format) | "2016-09-01" | Non-empty |

### Optional

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Field of Study | `field_of_study` | String | "Computer Science" |
| End Date | `end_date` | String | "2020-05-31" |
| Description | `description` | String | "Relevant coursework: AI, ML, Data Science" |

---

## **Step 5: Skills & Certifications**

### Skills

- **How to add:** Type a skill and press Enter or click Add
- **Examples:** "JavaScript", "Python", "Project Management", "Leadership"
- **Required?** No, but recommended
- **Backend field:** `raw_data.skills` (array of strings)

### Certifications (Optional)

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Name | `name` | String | "AWS Solutions Architect" |
| Issuing Organization | `issuing_organization` | String | "Amazon" |
| Issue Date | `issue_date` | String | "2022-06-15" |
| Expiration Date | `expiration_date` | String | "2025-06-15" |

### Custom Notes (Optional)

- **Purpose:** Additional info about you
- **Example:** "Available immediately", "Open to remote roles"
- **Backend field:** `raw_data.custom_notes`

---

## **Complete Example Submission**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "target_position": "Senior React Developer",
  "target_company": "Google",
  "priority": "high",
  "job_description": "We are looking for a Senior React Developer with 5+ years of experience. Must know TypeScript, Redux, testing frameworks.",
  "existing_cv_url": "",
  "raw_data": {
    "education": [
      {
        "institution": "MIT",
        "degree": "BS",
        "field_of_study": "Computer Science",
        "start_date": "2016-09-01",
        "end_date": "2020-05-31",
        "description": "Relevant coursework: AI, ML, Data Science"
      }
    ],
    "experience": [
      {
        "company": "Google",
        "role": "Senior Software Engineer",
        "start_date": "2021-06-01",
        "end_date": "",
        "description": "Led a team of 5 engineers building the React component library. Implemented 50+ reusable components used by 10 internal projects. Improved performance by 40%."
      },
      {
        "company": "Facebook",
        "role": "Software Engineer",
        "start_date": "2020-07-01",
        "end_date": "2021-05-31",
        "description": "Built features for Facebook Messenger using React. Mentored 2 junior engineers."
      }
    ],
    "skills": [
      "JavaScript",
      "TypeScript",
      "React",
      "Redux",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Git"
    ],
    "certifications": [
      {
        "name": "AWS Solutions Architect Professional",
        "issuing_organization": "Amazon",
        "issue_date": "2022-06-15",
        "expiration_date": "2025-06-15"
      }
    ],
    "custom_notes": "Available immediately. Prefer remote roles. Open to contracts or full-time."
  }
}
```

---

## **Common "Bad Request" Errors & Fixes**

### Error 1: Missing Required Fields
**Symptoms:** Bad request with 400 error  
**Fix:** Ensure all required fields are filled:
- ✅ First Name
- ✅ Last Name
- ✅ Email (valid format)
- ✅ Target Position
- ✅ Job Description
- ✅ At least 1 Experience entry
- ✅ At least 1 Education entry

### Error 2: Invalid Email Format
**Symptoms:** "email" field rejected  
**Fix:** Use format: `user@domain.com`

### Error 3: Empty Arrays
**Symptoms:** Experiences or education show as empty  
**Fix:** Make sure you click "Add Experience" or "Add Education" buttons after filling in the form. Don't just fill the fields.

### Error 4: Date Format Issues
**Symptoms:** Dates rejected  
**Fix:** Use any standard date format:
- ✅ `2024-06-30`
- ✅ `06/30/2024`
- ✅ `June 30, 2024`

### Error 5: Special Characters
**Symptoms:** Description or name fields rejected  
**Fix:** Avoid special characters like `<>{}[]` - stick to letters, numbers, spaces, and basic punctuation (., -, (), &).

---

## **Step-by-Step Form Filling Checklist**

### Step 1: Personal Information ✅
- [ ] Enter first name (e.g., "John")
- [ ] Enter last name (e.g., "Doe")
- [ ] Enter email (e.g., "john@example.com")
- [ ] (Optional) Enter phone
- [ ] Click "Next"

### Step 2: Job Target ✅
- [ ] Enter target position (e.g., "Senior React Developer")
- [ ] Enter job description (paste the full job posting here)
- [ ] (Optional) Enter target company
- [ ] (Optional) Select priority level
- [ ] Click "Next"

### Step 3: Work Experience ✅
- [ ] Enter company name
- [ ] Enter job title
- [ ] Enter start date
- [ ] (Optional) Enter end date (leave empty if current job)
- [ ] Enter description of what you did
- [ ] Click "Add Experience"
- [ ] Repeat for additional jobs (add at least 1)
- [ ] Click "Next"

### Step 4: Education ✅
- [ ] Enter institution name
- [ ] Enter degree (BS, MS, BA, etc.)
- [ ] Enter start date
- [ ] (Optional) Enter end date
- [ ] (Optional) Enter field of study
- [ ] (Optional) Enter description
- [ ] Click "Add Education"
- [ ] Repeat if needed (add at least 1)
- [ ] Click "Next"

### Step 5: Skills & Certifications ✅
- [ ] Add 5-10 relevant skills
- [ ] (Optional) Add certifications
- [ ] (Optional) Add custom notes
- [ ] Click "Next"

### Step 6: Review ✅
- [ ] Review all information
- [ ] Click "Submit Resume" to send to backend

---

## **Backend is Saying "Bad Request"?**

Check the browser console (F12 → Console tab):

```javascript
// You should see logged:
Making submission request to: https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions
API_BASE_URL: https://ai-cv-generator-be-production.up.railway.app

// Then the submission data object
// Look for any empty required fields
```

If you see the submission data logged, copy it and verify:
1. `first_name`, `last_name`, `email` are NOT empty
2. `target_position`, `job_description` are NOT empty
3. `raw_data.experience` is NOT an empty array
4. `raw_data.education` is NOT an empty array
5. Email is in valid format (contains `@` and `.`)

---

## **Help! Still Getting Bad Request?**

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Go to Console tab**
3. **Fill the form and submit**
4. **Look for the logged submission data**
5. **Share the logged data** so we can see exactly what's being sent

The console will show exactly what payload was sent, which helps debug the issue.
