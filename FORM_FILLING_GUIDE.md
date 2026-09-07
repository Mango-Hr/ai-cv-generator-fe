# Resume Form Filling Guide

The SubmitCV form collects the client's full intake profile. The top-level API
fields (`first_name`, `last_name`, `email`, `phone`, `target_position`, ...)
preserve the documented backend contract; all new intake fields are delivered in
`raw_data`. Here's how each step maps to the payload:

---

## **Step 1: Basic Profile & Contact**

### Required Fields

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| First Name | `first_name` | String | "John" | Non-empty |
| Last Name | `last_name` | String | "Doe" | Non-empty |
| Email | `email` | String | "john@example.com" | Valid email format |
| Resume File | `raw_data.resume_file_name` | String | "John_Doe_Resume.pdf" | PDF or DOCX only (max 10MB) |

### Optional Fields

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Middle Name | `raw_data.middle_name` | String | "Michael" |
| Date of Birth | `raw_data.date_of_birth` | Date | "1990-04-12" |
| Phone | `phone` | String | "+1-555-123-4567" |
| Full Address | `raw_data.address` | String | "123 Main St, San Francisco, CA 94105, USA" |
| LinkedIn URL | `raw_data.linkedin_url` | String (URL) | "https://linkedin.com/in/johndoe" |
| Portfolio / GitHub | `raw_data.portfolio_github_url` | String (URL) | "https://github.com/johndoe" |

> **Note on file upload:** the current API accepts JSON only, so only the file
> name/size/type metadata is transmitted (`raw_data.resume_file_name`). A
> multipart upload endpoint is needed to send the actual file bytes.

---

## **Step 2: Job Preferences**

### Required Fields

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| Desired Job Title(s) | `target_position` / `raw_data.desired_job_titles` | String | "Senior React Developer, Frontend Engineer" | Non-empty, comma-separated for multiple |

### Optional Fields

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Preferred Work Arrangement | `raw_data.preferred_work_arrangement` | String | "remote", "hybrid", or "onsite" |
| Expected Salary Range | `raw_data.expected_salary_range` | String | "$120,000 - $150,000" |
| Date Available to Start | `raw_data.date_available_to_start` | Date | "2026-10-01" |
| Companies to Exclude | `raw_data.companies_to_exclude` | String | "Google, Meta" |

---

## **Step 3: Eligibility**

All optional.

| Form Field | Backend Field | Type | Example |
|-----------|--------------|------|---------|
| Active Security Clearance | `raw_data.active_security_clearance` | String | "yes" / "no" |
| Citizenship / Work Authorization | `raw_data.citizenship_work_authorization` | String | "US Citizen", "Green Card", "H-1B" |
| Visa Sponsorship Needed | `raw_data.visa_sponsorship_needed` | String | "yes" / "no" |
| Non-Compete / Restrictive Obligations | `raw_data.non_compete_obligations` | String | "yes" / "no" |

---

## **Step 4: References**

Optional, repeatable. Each entry maps to `raw_data.references[]`:

| Form Field | Backend Field | Type | Example | Rules |
|-----------|--------------|------|---------|-------|
| Name | `name` | String | "Jane Smith" | Non-empty |
| Email | `email` | String | "jane@example.com" | Valid email format |
| Phone | `phone` | String | "+1-555-987-6543" | Non-empty |
| Company | `company` | String | "Acme Corp" | Optional |

---

## **Step 5: EEO & Demographics**

Voluntary — the form states responses do not affect consideration. All fields
map under `raw_data.eeo` and include a "Prefer not to say" option.

| Form Field | Backend Field | Example |
|-----------|--------------|---------|
| Gender | `eeo.gender` | "male", "female", "non_binary", "prefer_not_to_say" |
| Sexual Orientation | `eeo.sexual_orientation` | "heterosexual", "gay_lesbian", "bisexual", ... |
| Race / Ethnicity | `eeo.race_ethnicity` | "asian", "black", "hispanic", "white", ... |
| Veteran Status | `eeo.veteran_status` | "veteran", "not_veteran", "prefer_not_to_say" |
| Disability Status | `eeo.disability_status` | "disability", "no_disability", "prefer_not_to_say" |
| Notes | `eeo.notes` | Free text |

---

## **Step 6: Review**

- Review all submitted information
- Edit any section
- Click "Build Resume" to send to backend

---

## **Complete Example Submission**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-123-4567",
  "target_position": "Senior React Developer, Frontend Engineer",
  "target_company": "",
  "priority": "normal",
  "job_description": "",
  "existing_cv_url": "",
  "raw_data": {
    "middle_name": "Michael",
    "date_of_birth": "1990-04-12",
    "address": "123 Main Street, Apt 4B, San Francisco, CA 94105, USA",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "portfolio_github_url": "https://github.com/johndoe",
    "resume_file_name": "John_Doe_Resume.pdf",
    "desired_job_titles": "Senior React Developer, Frontend Engineer",
    "preferred_work_arrangement": "hybrid",
    "expected_salary_range": "$120,000 - $150,000",
    "date_available_to_start": "2026-10-01",
    "companies_to_exclude": "Google, Meta",
    "active_security_clearance": "no",
    "citizenship_work_authorization": "US Citizen",
    "visa_sponsorship_needed": "no",
    "non_compete_obligations": "no",
    "references": [
      {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1-555-987-6543",
        "company": "Acme Corp"
      }
    ],
    "eeo": {
      "gender": "male",
      "sexual_orientation": "prefer_not_to_say",
      "race_ethnicity": "white",
      "veteran_status": "not_veteran",
      "disability_status": "no_disability",
      "notes": "Open to relocation. Available immediately."
    }
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
- ✅ Desired Job Title(s)
- ✅ Resume file uploaded (PDF/DOCX)

### Error 2: Invalid Email Format
**Symptoms:** "email" field rejected
**Fix:** Use format: `user@domain.com`

### Error 3: Unsupported Resume File Type
**Symptoms:** Upload rejected
**Fix:** Use PDF or DOCX only — other file types are blocked client-side.

### Error 4: Reference Entry Rejected
**Symptoms:** Reference not added
**Fix:** Every reference needs a name, a valid email, and a phone number.

---

## **Step-by-Step Form Filling Checklist**

### Step 1: Basic Profile & Contact ✅
- [ ] Enter first name (e.g., "John")
- [ ] (Optional) Enter middle name
- [ ] Enter last name (e.g., "Doe")
- [ ] Enter email (e.g., "john@example.com")
- [ ] (Optional) Enter date of birth
- [ ] (Optional) Enter phone
- [ ] (Optional) Enter full address
- [ ] (Optional) Enter LinkedIn URL
- [ ] (Optional) Enter portfolio/GitHub link
- [ ] Upload resume (PDF or DOCX)
- [ ] Click "Next Step"

### Step 2: Job Preferences ✅
- [ ] Enter desired job title(s) (e.g., "Senior React Developer")
- [ ] (Optional) Select preferred work arrangement
- [ ] (Optional) Enter expected salary range
- [ ] (Optional) Enter date available to start
- [ ] (Optional) Enter companies to exclude
- [ ] Click "Next Step"

### Step 3: Eligibility ✅
- [ ] (Optional) Select active security clearance
- [ ] (Optional) Enter citizenship / work authorization
- [ ] (Optional) Select visa sponsorship needed
- [ ] (Optional) Select non-compete / restrictive obligations
- [ ] Click "Next Step"

### Step 4: References ✅
- [ ] (Optional) Enter reference name, email, phone, company
- [ ] Click "Add Reference"
- [ ] Repeat for additional references
- [ ] Click "Next Step"

### Step 5: EEO & Demographics ✅
- [ ] (Voluntary) Select gender, sexual orientation, race/ethnicity, veteran status, disability status
- [ ] (Optional) Enter notes
- [ ] Click "Next Step"

### Step 6: Review ✅
- [ ] Review all information
- [ ] Click "Build Resume" to send to backend