import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header/Header'
import Button from '../components/shared/Button'
import { Input, Textarea, Select } from '../components/shared/Input'
import FileUpload from '../components/shared/FileUpload'
import { useToast } from '../contexts/ToastContext'
import { createSubmission, uploadFile } from '../services/submissionService'
import './SubmitCV.css'

const STEPS = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Job Prefs' },
  { id: 3, label: 'Eligibility' },
  { id: 4, label: 'References' },
  { id: 5, label: 'EEO' },
  { id: 6, label: 'Review' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Backend enum: WorkArrangement
const WORK_ARRANGEMENT_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'flexible', label: 'Flexible' },
]

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

// Backend enum: SecurityClearance
const SECURITY_CLEARANCE_OPTIONS = [
  { value: 'none', label: 'No clearance' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'secret', label: 'Secret' },
  { value: 'top_secret', label: 'Top Secret' },
  { value: 'top_secret_sci', label: 'Top Secret / SCI' },
  { value: 'other', label: 'Other clearance' },
]

// Backend enum: Gender
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

// Backend enum: SexualOrientation
const SEXUAL_ORIENTATION_OPTIONS = [
  { value: 'heterosexual', label: 'Heterosexual / Straight' },
  { value: 'gay_or_lesbian', label: 'Gay / Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

// Backend enum: RaceEthnicity
const RACE_ETHNICITY_OPTIONS = [
  { value: 'american_indian_or_alaska_native', label: 'American Indian / Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black_or_african_american', label: 'Black / African American' },
  { value: 'hispanic_or_latino', label: 'Hispanic / Latino' },
  { value: 'native_hawaiian_or_pacific_islander', label: 'Native Hawaiian / Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'two_or_more_races', label: 'Two or more races' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

// Backend enum: VeteranStatus
const VETERAN_STATUS_OPTIONS = [
  { value: 'veteran', label: 'Veteran' },
  { value: 'not_a_veteran', label: 'Not a veteran' },
  { value: 'active_duty', label: 'Active duty' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

// Backend enum: DisabilityStatus
const DISABILITY_STATUS_OPTIONS = [
  { value: 'yes', label: 'Yes, I have a disability' },
  { value: 'no', label: 'No, I do not have a disability' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const optionLabel = (options, value) => {
  if (!value) return ''
  const option = options.find(o => o.value === value)
  return option ? option.label : value
}

// Default empty form state
const EMPTY_FORM_DATA = {
  // Basic Profile & Contact
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  phone: '',
  address: '',
  linkedinUrl: '',
  portfolioGithubUrl: '',
  resumeFile: null,

  // Job Preferences
  desiredJobTitles: '',
  workArrangement: '',
  salaryRange: '',
  availableToStart: '',
  companiesToExclude: '',

  // Eligibility
  securityClearance: '',
  citizenship: '',
  visaSponsorship: '',
  nonCompete: '',

  // References
  references: [],

  // EEO & Demographics (voluntary)
  gender: '',
  sexualOrientation: '',
  raceEthnicity: '',
  veteranStatus: '',
  disabilityStatus: '',
  notes: '',
}

/**
 * Load a partially-filled submission from localStorage when ?resume=<id> is
 * present. Supports both the current flat form_data shape and the legacy
 * { personal, job_target } grouping.
 */
const loadStoredSubmission = (searchParams) => {
  const resumeId = searchParams.get('resume')
  console.log('🔍 Resume param check - resumeId:', resumeId)

  if (!resumeId) return null

  try {
    const storedKey = `submission_${resumeId}`
    const storedData = localStorage.getItem(storedKey)

    console.log('📦 Looking for:', storedKey)
    console.log('📦 Found:', storedData ? `${storedData.length} chars` : 'null')

    if (!storedData) {
      console.warn('❌ No stored data found for submission:', storedKey)
      return { resumeId, formData: null, status: 'empty' }
    }

    const parsed = JSON.parse(storedData)
    console.log('✅ Parsed data keys:', Object.keys(parsed))
    console.log('✅ Has form_data:', !!parsed.form_data)

    if (!parsed.form_data) {
      console.warn('❌ No form_data found in parsed submission')
      return { resumeId, formData: null, status: 'empty' }
    }

    const old = parsed.form_data
    const personal = old.personal || {}
    const jobTarget = old.job_target || {}

    const newFormData = {
      // Basic profile & contact
      firstName: old.firstName || personal.firstName || '',
      middleName: old.middleName || '',
      lastName: old.lastName || personal.lastName || '',
      email: old.email || personal.email || '',
      dateOfBirth: old.dateOfBirth || '',
      phone: old.phone || personal.phone || '',
      address: old.address || '',
      linkedinUrl: old.linkedinUrl || '',
      portfolioGithubUrl: old.portfolioGithubUrl || '',
      resumeFile: old.resumeFile || null,

      // Job preferences
      desiredJobTitles: old.desiredJobTitles || jobTarget.targetPosition || '',
      workArrangement: old.workArrangement || '',
      salaryRange: old.salaryRange || '',
      availableToStart: old.availableToStart || '',
      companiesToExclude: old.companiesToExclude || '',

      // Eligibility
      securityClearance: old.securityClearance || '',
      citizenship: old.citizenship || '',
      visaSponsorship: old.visaSponsorship || '',
      nonCompete: old.nonCompete || '',

      // References
      references: Array.isArray(old.references) ? old.references : [],

      // EEO / demographics
      gender: old.gender || '',
      sexualOrientation: old.sexualOrientation || '',
      raceEthnicity: old.raceEthnicity || '',
      veteranStatus: old.veteranStatus || '',
      disabilityStatus: old.disabilityStatus || '',
      notes: old.notes || old.customNotes || '',
    }

    console.log('📝 Form data loaded from storage:', newFormData)
    return { resumeId, formData: newFormData, status: 'loaded' }
  } catch (error) {
    console.error('❌ Error loading submission data:', error)
    console.error('Stack:', error.stack)
    return { resumeId, formData: null, status: 'error' }
  }
}

// Sample data for testing/demo purposes
const SAMPLE_DATA = {
  formData: {
    // Basic profile & contact
    firstName: 'John',
    middleName: 'Michael',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-04-12',
    phone: '+1-555-123-4567',
    address: '123 Main Street, Apt 4B, San Francisco, CA 94105, USA',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    portfolioGithubUrl: 'https://github.com/johndoe',
    resumeFile: { name: 'John_Doe_Resume.pdf', size: 245760, type: 'application/pdf' },

    // Job preferences
    desiredJobTitles: 'Senior React Developer, Frontend Engineer',
    workArrangement: 'hybrid',
    salaryRange: '$120,000 - $150,000',
    availableToStart: '2026-10-01',
    companiesToExclude: 'Google, Meta',

    // Eligibility
    securityClearance: 'none',
    citizenship: 'US Citizen',
    visaSponsorship: 'no',
    nonCompete: 'no',

    // References
    references: [
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-987-6543',
        company: 'Acme Corp',
        id: 1,
      },
    ],

    // EEO / demographics (voluntary)
    gender: 'male',
    sexualOrientation: 'prefer_not_to_say',
    raceEthnicity: 'white',
    veteranStatus: 'not_a_veteran',
    disabilityStatus: 'no',
    notes: 'Open to relocation. Available immediately.',
  },
}

export default function SubmitCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  // True when the user is editing a step reached from the Review page, so the
  // next "Next Step" click returns to Review instead of the literal next step.
  const [returnToReview, setReturnToReview] = useState(false)

  const [resumed] = useState(() => loadStoredSubmission(searchParams))
  const [formData, setFormData] = useState(() =>
    resumed?.formData ? { ...resumed.formData } : EMPTY_FORM_DATA
  )

  // Show a toast when resuming a previous submission (side effect only)
  useEffect(() => {
    if (!resumed?.resumeId) return
    if (resumed.status === 'loaded') {
      toast.success('Resuming previous submission...')
    } else if (resumed.status === 'error') {
      toast.error('Failed to load submission data')
    }
  }, [resumed, toast])

  const [currentReference, setCurrentReference] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const autoFillForm = () => {
    setFormData(SAMPLE_DATA.formData)
    setCurrentStep(6) // Jump to review step
    toast.success('Form auto-filled! Review the data and submit.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearForm = () => {
    setFormData({ ...EMPTY_FORM_DATA })
    setCurrentReference({ name: '', email: '', phone: '', company: '' })
    setCurrentStep(1)
    setReturnToReview(false)
    setErrors({})
    toast.success('Form cleared')
  }

  const addReference = () => {
    const refErrors = {}

    if (!currentReference.name.trim()) {
      refErrors.name = 'Name is required'
    }
    if (!currentReference.email.trim()) {
      refErrors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(currentReference.email.trim())) {
      refErrors.email = 'Please enter a valid email address'
    }
    if (!currentReference.phone.trim()) {
      refErrors.phone = 'Phone is required'
    }
    // company is optional

    if (Object.keys(refErrors).length > 0) {
      setErrors(prev => ({ ...prev, reference: refErrors }))
      return
    }

    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { ...currentReference, id: Date.now() }]
    }))

    setCurrentReference({ name: '', email: '', phone: '', company: '' })
    setErrors(prev => ({ ...prev, reference: {} }))
    toast.success('Reference added')
  }

  const removeReference = (id) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter(ref => ref.id !== id)
    }))
  }

  const validateStep = () => {
    const stepErrors = {}

    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) {
          stepErrors.firstName = 'First name is required'
        }
        if (!formData.lastName.trim()) {
          stepErrors.lastName = 'Last name is required'
        }
        if (!formData.email.trim()) {
          stepErrors.email = 'Email is required'
        } else if (!EMAIL_REGEX.test(formData.email.trim())) {
          stepErrors.email = 'Please enter a valid email address'
        }
        if (!formData.resumeFile) {
          stepErrors.resumeFile = 'Please upload your resume (PDF or DOCX)'
        }
        break
      case 2:
        if (!formData.desiredJobTitles.trim()) {
          stepErrors.desiredJobTitles = 'Desired job title is required'
        }
        break
      // Steps 3-5 have no required fields (EEO is voluntary by design)
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      console.log('Validation failed for step', currentStep, ':', stepErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleEditFromReview = (step) => {
    setReturnToReview(true)
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextStep = () => {
    if (!validateStep()) return
    // Coming from an edit started on the Review page: go straight back to Review
    if (returnToReview) {
      setReturnToReview(false)
      setCurrentStep(STEPS.length)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // 1. Upload the actual resume file first (POST /api/v1/public/upload →
      //    Cloudinary) so the submission can carry a CDN URL.
      let resumeFileUrl = null
      const resumeFile = formData.resumeFile
      if (resumeFile && resumeFile instanceof File) {
        console.log('Uploading resume file:', resumeFile.name)
        const uploadResult = await uploadFile(resumeFile, 'resumes')
        resumeFileUrl = uploadResult.primary
        if (!resumeFileUrl) {
          throw new Error('File upload succeeded but no file URL was returned. Please try again.')
        }
        console.log('Resume uploaded to:', resumeFileUrl)
      }

      // 2. Build the payload to match the backend CreateSubmission schema.
      //    Only first_name, last_name and email are required — everything else
      //    is optional, so empty values are omitted instead of sent as ''.
      const splitList = (value) =>
        (value || '')
          .split(/[\n,]+/)
          .map(item => item.trim())
          .filter(Boolean)

      const desiredTitles = splitList(formData.desiredJobTitles)
      const excludedCompanies = splitList(formData.companiesToExclude)

      const submissionData = {
        // Required by the backend
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),

        // Profile & contact
        middle_name: formData.middleName.trim() || undefined,
        date_of_birth: formData.dateOfBirth || undefined,
        phone: formData.phone.trim() || undefined,
        address_line: formData.address.trim() || undefined,
        linkedin_url: formData.linkedinUrl.trim() || undefined,
        portfolio_url: formData.portfolioGithubUrl.trim() || undefined,

        // Resume
        resume_file_url: resumeFileUrl || undefined,
        resume_file_name: resumeFile?.name || undefined,

        // Job preferences
        desired_job_titles: desiredTitles.length > 0 ? desiredTitles : undefined,
        preferred_work_arrangement: formData.workArrangement || undefined,
        expected_salary_range: formData.salaryRange.trim() || undefined,
        available_start_date: formData.availableToStart || undefined,
        companies_to_exclude: excludedCompanies.length > 0 ? excludedCompanies : undefined,
        target_position: desiredTitles[0] || undefined,
        priority: 'normal',

        // Eligibility (security_clearance & visa_sponsorship_required are
        // backend enums — see SECURITY_CLEARANCE_OPTIONS / YES_NO_OPTIONS;
        // non_compete_obligations is free text, so map the Yes/No answer)
        security_clearance: formData.securityClearance || undefined,
        citizenship_status: formData.citizenship.trim() || undefined,
        visa_sponsorship_required: formData.visaSponsorship || undefined,
        non_compete_obligations:
          formData.nonCompete === 'yes' ? 'Yes' :
          formData.nonCompete === 'no' ? 'None' : undefined,

        // References (backend ProfessionalReference: name required, rest optional)
        professional_references: formData.references.length > 0
          ? formData.references.map(ref => ({
              name: ref.name,
              email: ref.email || undefined,
              phone: ref.phone || undefined,
              company: ref.company || undefined,
            }))
          : undefined,

        // EEO & demographics (backend enums — see the option constants above)
        gender: formData.gender || undefined,
        sexual_orientation: formData.sexualOrientation || undefined,
        race_ethnicity: formData.raceEthnicity || undefined,
        veteran_status: formData.veteranStatus || undefined,
        has_disability: formData.disabilityStatus || undefined,
        notes: formData.notes.trim() || undefined,
      }

      // Drop undefined keys so only what the client filled in is sent
      const payload = Object.fromEntries(
        Object.entries(submissionData).filter(([, v]) => v !== undefined)
      )

      // Call API
      const response = await createSubmission(payload)

      // 3. Extract identifiers defensively — the backend documents responses as
      //    untyped, so check the common envelopes ({...}, {data: {...}}) plus a
      //    few legacy field names.
      console.log('Response structure:', response)
      if (typeof response === 'object' && response !== null) {
        console.log('Full response keys:', Object.keys(response))
      }
      const envelope = response && typeof response === 'object' ? (response.data ?? response) : {}
      const submissionId =
        envelope?.submission_id || envelope?.id ||
        response?.submission_id || response?.id ||
        envelope?.submission?.id || null
      const accessToken =
        envelope?.access_token || envelope?.client_access_token ||
        response?.access_token || response?.token || null

      console.log('Extracted submissionId:', submissionId)
      console.log('Extracted accessToken:', accessToken ? `${accessToken.substring(0, 8)}...` : 'MISSING')

      if (!submissionId || !accessToken) {
        console.error('❌ Missing required fields in response!')
        console.error('Response:', response)
        throw new Error('The backend did not return a submission ID and access token. Please contact support.')
      }

      const storedData = {
        access_token: accessToken,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        resume_file_url: resumeFileUrl,
        created_at: new Date().toISOString(),
        form_data: {
          ...formData,
          // Store only file metadata (bytes cannot be sent over this JSON API)
          resumeFile: formData.resumeFile
            ? { name: formData.resumeFile.name, size: formData.resumeFile.size, type: formData.resumeFile.type }
            : null,
        },
      }

      localStorage.setItem(`submission_${submissionId}`, JSON.stringify(storedData))
      console.log('✅ Stored in localStorage:', `submission_${submissionId}`)

      toast.success('Resume submitted successfully!')
      console.log('Navigating to:', `/submit/success?id=${submissionId}`)
      navigate(`/submit/success?id=${submissionId}`)
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ submit: error.message || 'Failed to build resume. Please try again.' })
      setIsSubmitting(false)
    }
  }

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <Header />
      <div className="submit-cv">
        <div className="submit-cv__container">
          {/* Header */}
          <div className="submit-cv__header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="submit-cv__title">Build Your Resume</h1>
                <p className="submit-cv__subtitle">
                  Tell us about yourself, upload your CV, and our team will craft your professional resume
                </p>
              </div>
              {/* Auto-fill buttons for testing */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={autoFillForm}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Auto-fill form with sample data for testing"
                >
                   Auto-fill
                </button>
                <button
                  onClick={clearForm}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  title="Clear all form data"
                >
                   Clear
                </button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="submit-cv__progress">
            <div className="submit-cv__steps">
              <div
                className="submit-cv__step-line"
                style={{ width: `${progressPercentage}%` }}
              />

              {STEPS.map(step => (
                <div
                  key={step.id}
                  className={`submit-cv__step ${
                    step.id < currentStep ? 'submit-cv__step--completed' : ''
                  } ${step.id === currentStep ? 'submit-cv__step--active' : ''}`}
                >
                  <div className="submit-cv__step-circle">
                    {step.id < currentStep ? <Check size={18} /> : step.id}
                  </div>
                  <span className="submit-cv__step-label">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <div className="submit-cv__error-alert" role="alert">
              {errors.submit}
            </div>
          )}

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <StepProfileAndContact formData={formData} updateField={updateField} errors={errors} />
              )}

              {currentStep === 2 && (
                <StepJobPreferences formData={formData} updateField={updateField} errors={errors} />
              )}

              {currentStep === 3 && (
                <StepEligibility formData={formData} updateField={updateField} errors={errors} />
              )}

              {currentStep === 4 && (
                <StepReferences
                  references={formData.references}
                  currentReference={currentReference}
                  setCurrentReference={setCurrentReference}
                  addReference={addReference}
                  removeReference={removeReference}
                  errors={errors}
                />
              )}

              {currentStep === 5 && (
                <StepEEO formData={formData} updateField={updateField} errors={errors} />
              )}

              {currentStep === 6 && (
                <StepReview formData={formData} onEdit={handleEditFromReview} />
              )}

              {/* Navigation Actions */}
              <div className="submit-cv__actions">
                <div className="submit-cv__actions-left">
                  {currentStep > 1 && (
                    <Button
                      variant="ghost"
                      icon={<ArrowLeft />}
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div className="submit-cv__actions-right">
                  {currentStep < STEPS.length ? (
                    <Button
                      variant="primary"
                      icon={<ArrowRight />}
                      iconPosition="right"
                      onClick={nextStep}
                      disabled={isSubmitting}
                    >
                      {returnToReview ? 'Back to Review' : 'Next Step'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      loading={isSubmitting}
                    >
                      {isSubmitting ? 'Building...' : 'Build Resume'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

// Step Components

function StepProfileAndContact({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Basic Profile & Contact</h2>
      <p className="submit-cv__form-description">
        Your basic details so we can reach you and build your professional profile
      </p>

      <div className="submit-cv__form-fields">
        <div className="submit-cv__form-row submit-cv__form-row--three">
          <Input
            label="First Name"
            required
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
          />

          <Input
            label="Middle Name"
            placeholder="Michael"
            value={formData.middleName}
            onChange={(e) => updateField('middleName', e.target.value)}
            helpText="optional"
          />

          <Input
            label="Last Name"
            required
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
        />

        <div className="submit-cv__form-row">
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            error={errors.phone}
            helpText="optional"
          />
        </div>

        <Textarea
          label="Full Address"
          placeholder="Street address, city, state, ZIP, country"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          error={errors.address}
          rows={3}
          helpText="optional"
        />

        <div className="submit-cv__form-row">
          <Input
            label="LinkedIn URL"
            placeholder="https://linkedin.com/in/yourname"
            value={formData.linkedinUrl}
            onChange={(e) => updateField('linkedinUrl', e.target.value)}
            error={errors.linkedinUrl}
            helpText="optional"
          />

          <Input
            label="Portfolio / GitHub Link"
            placeholder="https://github.com/yourname"
            value={formData.portfolioGithubUrl}
            onChange={(e) => updateField('portfolioGithubUrl', e.target.value)}
            error={errors.portfolioGithubUrl}
            helpText="optional"
          />
        </div>

        <div>
          <label className="input-label">
            Resume File
            <span className="input-label__required">*</span>
          </label>
          <FileUpload
            accept=".pdf,.doc,.docx"
            maxSize={10}
            onUpload={(files) => updateField('resumeFile', files[0] || null)}
            onRemove={() => updateField('resumeFile', null)}
            error={errors.resumeFile}
            helpText="Upload your most recent resume. PDF or DOCX only."
          />
          {formData.resumeFile && (
            <p className="submit-cv__uploaded-note">
              ✓ Current upload: {formData.resumeFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function StepJobPreferences({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Job Preferences</h2>
      <p className="submit-cv__form-description">
        Tell us what kind of role you're looking for
      </p>

      <div className="submit-cv__form-fields">
        <Input
          label="Desired Job Title(s)"
          required
          placeholder="Senior React Developer, Frontend Engineer"
          value={formData.desiredJobTitles}
          onChange={(e) => updateField('desiredJobTitles', e.target.value)}
          error={errors.desiredJobTitles}
          helpText="Separate multiple titles with commas"
        />

        <Select
          label="Preferred Work Arrangement"
          placeholder="Select..."
          value={formData.workArrangement}
          onChange={(e) => updateField('workArrangement', e.target.value)}
          options={WORK_ARRANGEMENT_OPTIONS}
          error={errors.workArrangement}
        />

        <div className="submit-cv__form-row">
          <Input
            label="Expected Salary Range"
            placeholder="$100,000 - $130,000"
            value={formData.salaryRange}
            onChange={(e) => updateField('salaryRange', e.target.value)}
            error={errors.salaryRange}
            helpText="optional"
          />

          <Input
            label="Date Available to Start"
            type="date"
            value={formData.availableToStart}
            onChange={(e) => updateField('availableToStart', e.target.value)}
            error={errors.availableToStart}
            helpText="optional"
          />
        </div>

        <Textarea
          label="Companies to Exclude"
          placeholder="List companies you do not want your CV shared with..."
          value={formData.companiesToExclude}
          onChange={(e) => updateField('companiesToExclude', e.target.value)}
          error={errors.companiesToExclude}
          rows={3}
          helpText="optional — separate multiple companies with commas or new lines"
        />
      </div>
    </div>
  )
}

function StepEligibility({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Eligibility</h2>
      <p className="submit-cv__form-description">
        Employment eligibility and any obligations that may affect placement
      </p>

      <div className="submit-cv__form-fields">
        <div className="submit-cv__form-row">
          <Select
            label="Active Security Clearance"
            placeholder="Select..."
            value={formData.securityClearance}
            onChange={(e) => updateField('securityClearance', e.target.value)}
            options={SECURITY_CLEARANCE_OPTIONS}
            error={errors.securityClearance}
            helpText="Highest level you currently hold"
          />

          <Select
            label="Visa Sponsorship Needed"
            placeholder="Select..."
            value={formData.visaSponsorship}
            onChange={(e) => updateField('visaSponsorship', e.target.value)}
            options={YES_NO_OPTIONS}
            error={errors.visaSponsorship}
          />
        </div>

        <Input
          label="Citizenship / Work Authorization"
          placeholder="e.g. US Citizen, Green Card, H-1B"
          value={formData.citizenship}
          onChange={(e) => updateField('citizenship', e.target.value)}
          error={errors.citizenship}
          helpText="Your current citizenship or legal work authorization status"
        />

        <Select
          label="Non-Compete / Restrictive Obligations"
          placeholder="Select..."
          value={formData.nonCompete}
          onChange={(e) => updateField('nonCompete', e.target.value)}
          options={YES_NO_OPTIONS}
          error={errors.nonCompete}
          helpText="Do you have any non-compete or other restrictive agreements that could affect employment?"
        />
      </div>
    </div>
  )
}

function StepReferences({ references, currentReference, setCurrentReference, addReference, removeReference, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Professional References</h2>
      <p className="submit-cv__form-description">
        Add professional references we can contact about your work
      </p>

      <div className="submit-cv__form-fields">
        {errors.references && typeof errors.references === 'string' && (
          <div className="submit-cv__error-message" role="alert">
            {errors.references}
          </div>
        )}

        {/* Existing references */}
        {references.length > 0 && (
          <div className="submit-cv__items-list">
            {references.map(ref => (
              <div key={ref.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{ref.name}</div>
                    <div className="submit-cv__item-subtitle">
                      {ref.company ? `${ref.company} • ` : ''}{ref.email} • {ref.phone}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeReference(ref.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new reference form */}
        <div style={{
          paddingTop: references.length > 0 ? 'var(--space-6)' : 0,
          borderTop: references.length > 0 ? '1px solid var(--color-border)' : 'none'
        }}>
          <h3 style={{
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            {references.length > 0 ? 'Add Another Reference' : 'Add Your First Reference'}
          </h3>

          <Input
            label="Name"
            placeholder="Jane Smith"
            value={currentReference.name}
            onChange={(e) => setCurrentReference({ ...currentReference, name: e.target.value })}
            error={errors.reference?.name}
          />

          <div className="submit-cv__form-row">
            <Input
              label="Email"
              type="email"
              placeholder="jane.smith@example.com"
              value={currentReference.email}
              onChange={(e) => setCurrentReference({ ...currentReference, email: e.target.value })}
              error={errors.reference?.email}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={currentReference.phone}
              onChange={(e) => setCurrentReference({ ...currentReference, phone: e.target.value })}
              error={errors.reference?.phone}
            />
          </div>

          <Input
            label="Company"
            placeholder="Acme Corp"
            value={currentReference.company}
            onChange={(e) => setCurrentReference({ ...currentReference, company: e.target.value })}
            error={errors.reference?.company}
            helpText="optional"
          />

          <Button
            variant="secondary"
            icon={<Plus />}
            onClick={addReference}
            className="submit-cv__add-button"
          >
            {references.length > 0 ? 'Add Another Reference' : 'Add Reference'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepEEO({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">EEO & Demographics</h2>
      <p className="submit-cv__form-description">
        Optional questions for equal employment opportunity reporting
      </p>

      <div className="submit-cv__voluntary-note">
        <strong>Voluntary & confidential.</strong> These questions are optional. Your
        responses will not affect your application or consideration and are kept confidential.
      </div>

      <div className="submit-cv__form-fields">
        <div className="submit-cv__form-row">
          <Select
            label="Gender"
            placeholder="Select..."
            value={formData.gender}
            onChange={(e) => updateField('gender', e.target.value)}
            options={GENDER_OPTIONS}
            error={errors.gender}
          />

          <Select
            label="Sexual Orientation"
            placeholder="Select..."
            value={formData.sexualOrientation}
            onChange={(e) => updateField('sexualOrientation', e.target.value)}
            options={SEXUAL_ORIENTATION_OPTIONS}
            error={errors.sexualOrientation}
          />
        </div>

        <Select
          label="Race / Ethnicity"
          placeholder="Select..."
          value={formData.raceEthnicity}
          onChange={(e) => updateField('raceEthnicity', e.target.value)}
          options={RACE_ETHNICITY_OPTIONS}
          error={errors.raceEthnicity}
        />

        <div className="submit-cv__form-row">
          <Select
            label="Veteran Status"
            placeholder="Select..."
            value={formData.veteranStatus}
            onChange={(e) => updateField('veteranStatus', e.target.value)}
            options={VETERAN_STATUS_OPTIONS}
            error={errors.veteranStatus}
          />

          <Select
            label="Disability Status"
            placeholder="Select..."
            value={formData.disabilityStatus}
            onChange={(e) => updateField('disabilityStatus', e.target.value)}
            options={DISABILITY_STATUS_OPTIONS}
            error={errors.disabilityStatus}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Any additional information you would like to share..."
          value={formData.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          error={errors.notes}
          rows={4}
          helpText="optional"
        />
      </div>
    </div>
  )
}

function ReviewItem({ label, value }) {
  return (
    <div className="submit-cv__review-item">
      <span className="submit-cv__review-label">{label}:</span>
      <span className="submit-cv__review-value">{value || 'Not provided'}</span>
    </div>
  )
}

function StepReview({ formData, onEdit }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Review Your Information</h2>
      <p className="submit-cv__form-description">
        Please review your information before submitting
      </p>

      <div style={{ marginTop: 'var(--space-6)' }}>
        {/* Basic Profile & Contact */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Basic Profile & Contact</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <ReviewItem label="Full name" value={[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')} />
            <ReviewItem label="Email" value={formData.email} />
            <ReviewItem label="Date of birth" value={formData.dateOfBirth} />
            <ReviewItem label="Phone" value={formData.phone} />
            <ReviewItem label="Full address" value={formData.address} />
            <ReviewItem label="LinkedIn URL" value={formData.linkedinUrl} />
            <ReviewItem label="Portfolio / GitHub" value={formData.portfolioGithubUrl} />
            <ReviewItem label="Resume file" value={formData.resumeFile?.name} />
          </div>
        </div>

        {/* Job Preferences */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Job Preferences</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <ReviewItem label="Desired job titles" value={formData.desiredJobTitles} />
            <ReviewItem label="Work arrangement" value={optionLabel(WORK_ARRANGEMENT_OPTIONS, formData.workArrangement)} />
            <ReviewItem label="Expected salary range" value={formData.salaryRange} />
            <ReviewItem label="Available to start" value={formData.availableToStart} />
            <ReviewItem label="Companies to exclude" value={formData.companiesToExclude} />
          </div>
        </div>

        {/* Eligibility */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Eligibility</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <ReviewItem label="Security clearance" value={optionLabel(SECURITY_CLEARANCE_OPTIONS, formData.securityClearance)} />
            <ReviewItem label="Citizenship / work auth" value={formData.citizenship} />
            <ReviewItem label="Visa sponsorship needed" value={optionLabel(YES_NO_OPTIONS, formData.visaSponsorship)} />
            <ReviewItem label="Non-compete obligations" value={optionLabel(YES_NO_OPTIONS, formData.nonCompete)} />
          </div>
        </div>

        {/* References */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">References ({formData.references.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
              Edit
            </Button>
          </div>
          {formData.references.length > 0 && (
            <div className="submit-cv__review-content">
              {formData.references.map(ref => (
                <ReviewItem
                  key={ref.id}
                  label={ref.name}
                  value={[ref.company, ref.email, ref.phone].filter(Boolean).join(' • ')}
                />
              ))}
            </div>
          )}
        </div>

        {/* EEO & Demographics */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">EEO & Demographics</h3>
            <Button variant="ghost" size="sm" onClick={() => onEdit(5)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <ReviewItem label="Gender" value={optionLabel(GENDER_OPTIONS, formData.gender)} />
            <ReviewItem label="Sexual orientation" value={optionLabel(SEXUAL_ORIENTATION_OPTIONS, formData.sexualOrientation)} />
            <ReviewItem label="Race / ethnicity" value={optionLabel(RACE_ETHNICITY_OPTIONS, formData.raceEthnicity)} />
            <ReviewItem label="Veteran status" value={optionLabel(VETERAN_STATUS_OPTIONS, formData.veteranStatus)} />
            <ReviewItem label="Disability status" value={optionLabel(DISABILITY_STATUS_OPTIONS, formData.disabilityStatus)} />
            <ReviewItem label="Notes" value={formData.notes} />
          </div>
        </div>
      </div>
    </div>
  )
}