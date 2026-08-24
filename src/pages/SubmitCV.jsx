import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header/Header'
import Button from '../components/shared/Button'
import { Input, Textarea, Select } from '../components/shared/Input'
import { useToast } from '../contexts/ToastContext'
import { createSubmission } from '../services/submissionService'
import './SubmitCV.css'

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Job Target' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Education' },
  { id: 5, label: 'Skills' },
  { id: 6, label: 'Review' },
]

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

// Sample data for testing/demo purposes
const SAMPLE_DATA = {
  formData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    targetPosition: 'Senior React Developer',
    targetCompany: 'Google',
    jobDescription: `We are looking for an experienced Senior React Developer to join our team. 
Requirements:
- 5+ years of React and JavaScript experience
- Strong knowledge of TypeScript and modern web standards
- Experience with state management (Redux, Context API)
- Unit testing expertise (Jest, React Testing Library)
- REST API and GraphQL integration
- Performance optimization skills
- Mentoring experience preferred

Responsibilities:
- Design and implement scalable React components
- Lead code reviews and architectural decisions
- Mentor junior developers
- Collaborate with design and product teams`,
    priority: 'high',
    existingCVUrl: '',
    experiences: [
      {
        company: 'Google',
        role: 'Senior Software Engineer',
        startDate: '2021-06-01',
        endDate: '',
        description: 'Led a team of 5 engineers building the React component library. Implemented 50+ reusable components used by 10+ internal projects. Improved performance by 40% through code splitting and lazy loading.',
        id: 1,
      },
      {
        company: 'Facebook',
        role: 'Software Engineer',
        startDate: '2019-07-01',
        endDate: '2021-05-31',
        description: 'Built features for Facebook Messenger using React. Implemented real-time messaging with WebSocket. Mentored 2 junior engineers on React best practices.',
        id: 2,
      },
    ],
    education: [
      {
        institution: 'Massachusetts Institute of Technology (MIT)',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-05-31',
        description: 'Relevant coursework: Data Structures, Algorithms, Web Development, Machine Learning, Database Systems',
        id: 1,
      },
    ],
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Redux',
      'Node.js',
      'PostgreSQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Git',
      'REST APIs',
      'GraphQL',
    ],
    certifications: [
      {
        name: 'AWS Solutions Architect Professional',
        issuingOrganization: 'Amazon',
        issueDate: '2022-06-15',
        expirationDate: '2025-06-15',
        id: 1,
      },
    ],
    customNotes: 'Available immediately. Prefer remote roles. Open to contracts or full-time positions.',
  },
}

export default function SubmitCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '', // optional
    
    // Job Target
    targetPosition: '',
    targetCompany: '', // optional
    jobDescription: '',
    priority: 'normal',
    existingCVUrl: '', // optional
    
    // Experience
    experiences: [],
    
    // Education
    education: [],
    
    // Skills & Certifications
    skills: [],
    certifications: [],
    customNotes: '', // optional
  })

  const [currentExperience, setCurrentExperience] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '', // optional
    description: '',
  })

  const [currentEducation, setCurrentEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '', // optional
    startDate: '',
    endDate: '', // optional
    description: '', // optional
  })

  const [currentCertification, setCurrentCertification] = useState({
    name: '',
    issuingOrganization: '', // optional
    issueDate: '', // optional
    expirationDate: '', // optional
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Load submission data from localStorage when ?resume=<submissionId> is present
  useEffect(() => {
    const resumeId = searchParams.get('resume')
    if (resumeId) {
      try {
        const storedKey = `submission_${resumeId}`
        const storedData = localStorage.getItem(storedKey)
        
        if (storedData) {
          const parsed = JSON.parse(storedData)
          console.log('Loaded submission data:', parsed)
          
          if (parsed.form_data) {
            // Pre-fill the form with stored data
            setFormData(prev => ({
              ...prev,
              // Personal info
              firstName: parsed.form_data.personal?.firstName || prev.firstName,
              lastName: parsed.form_data.personal?.lastName || prev.lastName,
              email: parsed.form_data.personal?.email || prev.email,
              phone: parsed.form_data.personal?.phone || prev.phone,
              
              // Job target
              targetPosition: parsed.form_data.job_target?.targetPosition || prev.targetPosition,
              targetCompany: parsed.form_data.job_target?.targetCompany || prev.targetCompany,
              jobDescription: parsed.form_data.job_target?.jobDescription || prev.jobDescription,
              priority: parsed.form_data.job_target?.priority || prev.priority,
              existingCVUrl: parsed.form_data.job_target?.existingCVUrl || prev.existingCVUrl,
              
              // Collections
              experiences: parsed.form_data.experiences || prev.experiences,
              education: parsed.form_data.education || prev.education,
              skills: parsed.form_data.skills || prev.skills,
              certifications: parsed.form_data.certifications || prev.certifications,
              customNotes: parsed.form_data.customNotes || prev.customNotes,
            }))
            
            console.log('✅ Form pre-filled with submission data')
            toast.success('Resuming previous submission...')
          }
        } else {
          console.warn('No stored data found for submission:', resumeId)
        }
      } catch (error) {
        console.error('Error loading submission data:', error)
        toast.error('Failed to load submission data')
      }
    }
  }, [searchParams, toast])

  const autoFillForm = () => {
    setFormData(SAMPLE_DATA.formData)
    setCurrentStep(6) // Jump to review step
    toast.success('Form auto-filled! Review the data and submit.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      targetPosition: '',
      targetCompany: '',
      jobDescription: '',
      priority: 'normal',
      existingCVUrl: '',
      experiences: [],
      education: [],
      skills: [],
      certifications: [],
      customNotes: '',
    })
    setCurrentStep(1)
    setErrors({})
    toast.success('Form cleared')
  }

  const addExperience = () => {
    const expErrors = {}
    
    if (!currentExperience.company.trim()) {
      expErrors.company = 'Company name is required'
    }
    if (!currentExperience.role.trim()) {
      expErrors.role = 'Job title is required'
    }
    if (!currentExperience.startDate) {
      expErrors.startDate = 'Start date is required'
    }
    // endDate is optional
    if (!currentExperience.description.trim()) {
      expErrors.description = 'Description is required'
    }

    if (Object.keys(expErrors).length > 0) {
      setErrors(prev => ({ ...prev, experience: expErrors }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { ...currentExperience, id: Date.now() }]
    }))
    
    setCurrentExperience({ company: '', role: '', startDate: '', endDate: '', description: '' })
    setErrors(prev => ({ ...prev, experience: {} }))
    toast.success('Experience added')
  }

  const removeExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    const eduErrors = {}
    
    if (!currentEducation.institution.trim()) {
      eduErrors.institution = 'Institution is required'
    }
    if (!currentEducation.degree.trim()) {
      eduErrors.degree = 'Degree is required'
    }
    // fieldOfStudy is optional
    if (!currentEducation.startDate) {
      eduErrors.startDate = 'Start date is required'
    }
    // endDate is optional
    // description is optional

    if (Object.keys(eduErrors).length > 0) {
      setErrors(prev => ({ ...prev, education: eduErrors }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { ...currentEducation, id: Date.now() }]
    }))
    
    setCurrentEducation({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' })
    setErrors(prev => ({ ...prev, education: {} }))
    toast.success('Education added')
  }

  const removeEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const addCertification = () => {
    const certErrors = {}
    
    if (!currentCertification.name.trim()) {
      certErrors.name = 'Certification name is required'
    }
    // All other cert fields are optional

    if (Object.keys(certErrors).length > 0) {
      setErrors(prev => ({ ...prev, certification: certErrors }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...currentCertification, id: Date.now() }]
    }))
    
    setCurrentCertification({ name: '', issuingOrganization: '', issueDate: '', expirationDate: '' })
    setErrors(prev => ({ ...prev, certification: {} }))
    toast.success('Certification added')
  }

  const removeCertification = (id) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email.trim()) {
          stepErrors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
          stepErrors.email = 'Please enter a valid email address'
        }
        // phone is optional
        break
      case 2:
        if (!formData.targetPosition.trim()) {
          stepErrors.targetPosition = 'Target position is required'
        }
        // targetCompany is optional
        if (!formData.jobDescription.trim()) {
          stepErrors.jobDescription = 'Job description is required'
        }
        // existingCVUrl and priority are optional
        break
      case 3:
        if (formData.experiences.length === 0) {
          stepErrors.experiences = 'Please add at least one work experience'
        }
        break
      case 4:
        if (formData.education.length === 0) {
          stepErrors.education = 'Please add at least one education entry'
        }
        break
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      console.log('Validation failed for step', currentStep, ':', stepErrors)
      return false
    }

    setErrors({})
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
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

      // Transform formData to API format
      const submissionData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        target_position: formData.targetPosition,
        target_company: formData.targetCompany,
        priority: formData.priority,
        job_description: formData.jobDescription,
        existing_cv_url: formData.existingCVUrl,
        raw_data: {
          education: formData.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            start_date: edu.startDate,
            end_date: edu.endDate,
            description: edu.description,
          })),
          experience: formData.experiences.map(exp => ({
            company: exp.company,
            role: exp.role,
            start_date: exp.startDate,
            end_date: exp.endDate,
            description: exp.description,
          })),
          skills: formData.skills,
          certifications: formData.certifications.map(cert => ({
            name: cert.name,
            issuing_organization: cert.issuingOrganization,
            issue_date: cert.issueDate,
            expiration_date: cert.expirationDate,
          })),
          custom_notes: formData.customNotes,
        },
      }

      // Call API
      const response = await createSubmission(submissionData)
      
      console.log('Response structure:', response)
      console.log('Full response keys:', Object.keys(response))
      
      // Store submission data in localStorage for chat access
      // Backend returns: {status, status_code, message, data: {submission_id, access_token, ...}}
      const submissionId = response.data?.submission_id || response.submission_id || response.id
      const accessToken = response.data?.access_token || response.access_token
      
      console.log('Extracted submissionId:', submissionId)
      console.log('Extracted accessToken:', accessToken ? `${accessToken.substring(0, 8)}...` : 'MISSING')
      
      if (!submissionId || !accessToken) {
        console.error('❌ Missing required fields in response!')
        console.error('Response:', response)
        throw new Error('Invalid response from backend: missing submission_id or access_token')
      }
      
      const storedData = {
        access_token: accessToken,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        created_at: new Date().toISOString(),
        form_data: {
          personal: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          job_target: {
            targetPosition: formData.targetPosition,
            targetCompany: formData.targetCompany,
            jobDescription: formData.jobDescription,
            priority: formData.priority,
            existingCVUrl: formData.existingCVUrl,
          },
          experiences: formData.experiences,
          education: formData.education,
          skills: formData.skills,
          certifications: formData.certifications,
          customNotes: formData.customNotes,
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
                  Fill in your information and let our AI craft a professional Resume tailored to your target role
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
                  📋 Auto-fill
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
                  🗑️ Clear
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
                <StepPersonalInfo formData={formData} updateField={updateField} errors={errors} />
              )}
              
              {currentStep === 2 && (
                <StepJobTarget formData={formData} updateField={updateField} errors={errors} />
              )}
              
              {currentStep === 3 && (
                <StepExperience
                  experiences={formData.experiences}
                  currentExperience={currentExperience}
                  setCurrentExperience={setCurrentExperience}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  errors={errors}
                />
              )}
              
              {currentStep === 4 && (
                <StepEducation
                  education={formData.education}
                  currentEducation={currentEducation}
                  setCurrentEducation={setCurrentEducation}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                  errors={errors}
                />
              )}
              
              {currentStep === 5 && (
                <StepSkills 
                  formData={formData} 
                  updateField={updateField}
                  certifications={formData.certifications}
                  currentCertification={currentCertification}
                  setCurrentCertification={setCurrentCertification}
                  addCertification={addCertification}
                  removeCertification={removeCertification}
                  errors={errors}
                />
              )}
              
              {currentStep === 6 && (
                <StepReview formData={formData} setCurrentStep={setCurrentStep} />
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
                      Next Step
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
function StepPersonalInfo({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Personal Information</h2>
      <p className="submit-cv__form-description">
        Let's start with your basic information
      </p>

      <div className="submit-cv__form-fields">
        <div className="submit-cv__form-row">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
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
    </div>
  )
}

function StepJobTarget({ formData, updateField, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Target Position</h2>
      <p className="submit-cv__form-description">
        Tell us about the job you're applying for
      </p>

      <div className="submit-cv__form-fields">
        <Input
          label="Target Position"
          placeholder="Senior Product Manager"
          value={formData.targetPosition}
          onChange={(e) => updateField('targetPosition', e.target.value)}
          error={errors.targetPosition}
        />

        <Input
          label="Target Company"
          placeholder="Tech Corp"
          value={formData.targetCompany}
          onChange={(e) => updateField('targetCompany', e.target.value)}
          error={errors.targetCompany}
          helpText="optional"
        />

        <Textarea
          label="Job Description"
          placeholder="Paste the job description here..."
          value={formData.jobDescription}
          onChange={(e) => updateField('jobDescription', e.target.value)}
          error={errors.jobDescription}
          rows={8}
          helpText="Paste the full job description to help our AI tailor your resume"
        />

        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) => updateField('priority', e.target.value)}
          options={PRIORITY_OPTIONS}
          error={errors.priority}
        />

        <Input
          label="Existing CV URL"
          placeholder="https://example.com/my-cv.pdf"
          value={formData.existingCVUrl}
          onChange={(e) => updateField('existingCVUrl', e.target.value)}
          error={errors.existingCVUrl}
          helpText="optional"
        />
      </div>
    </div>
  )
}

function StepExperience({ experiences, currentExperience, setCurrentExperience, addExperience, removeExperience, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Work Experience</h2>
      <p className="submit-cv__form-description">
        Add your relevant work experience
      </p>

      <div className="submit-cv__form-fields">
        {/* Show error message if validation fails */}
        {errors.experiences && (
          <div className="submit-cv__error-message" role="alert">
            {errors.experiences}
          </div>
        )}

        {/* Existing experiences */}
        {experiences.length > 0 && (
          <div className="submit-cv__items-list">
            {experiences.map(exp => (
              <div key={exp.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{exp.role}</div>
                    <div className="submit-cv__item-subtitle">
                      {exp.company} • {exp.startDate} to {exp.endDate || 'Present'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeExperience(exp.id)}
                  />
                </div>
                {exp.description && (
                  <div className="submit-cv__item-body">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new experience form */}
        <div style={{ 
          paddingTop: experiences.length > 0 ? 'var(--space-6)' : 0,
          borderTop: experiences.length > 0 ? '1px solid var(--color-border)' : 'none'
        }}>
          <h3 style={{ 
            marginBottom: 'var(--space-4)', 
            fontSize: 'var(--text-sm)', 
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            {experiences.length > 0 ? 'Add More Experience' : 'Add Your First Experience'}
          </h3>

          <Input
            label="Company Name"
            placeholder="Tech Corp"
            value={currentExperience.company}
            onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
            error={errors.experience?.company}
          />

          <Input
            label="Job Title"
            placeholder="Product Manager"
            value={currentExperience.role}
            onChange={(e) => setCurrentExperience({ ...currentExperience, role: e.target.value })}
            error={errors.experience?.role}
          />

          <div className="submit-cv__form-row">
            <Input
              label="Start Date"
              type="date"
              value={currentExperience.startDate}
              onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
              error={errors.experience?.startDate}
            />

            <Input
              label="End Date"
              type="date"
              value={currentExperience.endDate}
              onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
              error={errors.experience?.endDate}
              helpText="optional"
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe your responsibilities and achievements..."
            value={currentExperience.description}
            onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
            error={errors.experience?.description}
            rows={4}
          />

          <Button
            variant="secondary"
            icon={<Plus />}
            onClick={addExperience}
            className="submit-cv__add-button"
          >
            {experiences.length > 0 ? 'Add Another Experience' : 'Add Experience'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepEducation({ education, currentEducation, setCurrentEducation, addEducation, removeEducation, errors }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Education</h2>
      <p className="submit-cv__form-description">
        Add your educational background
      </p>

      <div className="submit-cv__form-fields">
        {errors.education && typeof errors.education === 'string' && (
          <div className="submit-cv__error-message" role="alert">
            {errors.education}
          </div>
        )}

        {/* Existing education */}
        {education.length > 0 && (
          <div className="submit-cv__items-list">
            {education.map(edu => (
              <div key={edu.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{edu.degree}</div>
                    <div className="submit-cv__item-subtitle">
                      {edu.institution} {edu.fieldOfStudy && `• ${edu.fieldOfStudy}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeEducation(edu.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new education form */}
        <div style={{ 
          paddingTop: education.length > 0 ? 'var(--space-6)' : 0,
          borderTop: education.length > 0 ? '1px solid var(--color-border)' : 'none'
        }}>
          <h3 style={{ 
            marginBottom: 'var(--space-4)', 
            fontSize: 'var(--text-sm)', 
            fontWeight: 600,
            color: 'var(--color-text-secondary)'
          }}>
            {education.length > 0 ? 'Add More Education' : 'Add Your First Education'}
          </h3>

          <Input
            label="Institution"
            placeholder="University of Technology"
            value={currentEducation.institution}
            onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
            error={errors.education?.institution}
          />

          <Input
            label="Degree"
            placeholder="Bachelor of Science"
            value={currentEducation.degree}
            onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
            error={errors.education?.degree}
          />

          <Input
            label="Field of Study"
            placeholder="Computer Science"
            value={currentEducation.fieldOfStudy}
            onChange={(e) => setCurrentEducation({ ...currentEducation, fieldOfStudy: e.target.value })}
            error={errors.education?.fieldOfStudy}
            helpText="optional"
          />

          <div className="submit-cv__form-row">
            <Input
              label="Start Date"
              type="date"
              value={currentEducation.startDate}
              onChange={(e) => setCurrentEducation({ ...currentEducation, startDate: e.target.value })}
              error={errors.education?.startDate}
            />

            <Input
              label="End Date"
              type="date"
              value={currentEducation.endDate}
              onChange={(e) => setCurrentEducation({ ...currentEducation, endDate: e.target.value })}
              error={errors.education?.endDate}
              helpText="optional"
            />
          </div>

          <Textarea
            label="Description"
            placeholder="GPA, relevant coursework, thesis..."
            value={currentEducation.description}
            onChange={(e) => setCurrentEducation({ ...currentEducation, description: e.target.value })}
            error={errors.education?.description}
            rows={3}
            helpText="optional"
          />

          <Button
            variant="secondary"
            icon={<Plus />}
            onClick={addEducation}
            className="submit-cv__add-button"
          >
            {education.length > 0 ? 'Add Another Education' : 'Add Education'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepSkills({ formData, updateField, certifications, currentCertification, setCurrentCertification, addCertification, removeCertification, errors }) {
  const handleSkillsChange = (e) => {
    const skillsText = e.target.value
    const skillsArray = skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0)
    updateField('skills', skillsArray)
  }

  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Skills & Certifications</h2>
      <p className="submit-cv__form-description">
        Add your skills, certifications, and any additional information
      </p>

      <div className="submit-cv__form-fields">
        <Textarea
          label="Skills"
          placeholder="Product Strategy, Agile, Stakeholder Management..."
          value={formData.skills.join(', ')}
          onChange={handleSkillsChange}
          error={errors.skills}
          rows={4}
          helpText="List your relevant skills, separated by commas"
        />

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="submit-cv__items-list">
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
              Added Certifications ({certifications.length})
            </label>
            {certifications.map(cert => (
              <div key={cert.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{cert.name}</div>
                    {cert.issuingOrganization && (
                      <div className="submit-cv__item-subtitle">{cert.issuingOrganization}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeCertification(cert.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.certification && (
          <div className="submit-cv__error-message" role="alert">
            {errors.certification.name}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            Add New Certification
          </h3>

          <Input
            label="Certification Name"
            placeholder="AWS Solutions Architect"
            value={currentCertification.name}
            onChange={(e) => setCurrentCertification({ ...currentCertification, name: e.target.value })}
            error={errors.certification?.name}
          />

          <Input
            label="Issuing Organization"
            placeholder="Amazon Web Services"
            value={currentCertification.issuingOrganization}
            onChange={(e) => setCurrentCertification({ ...currentCertification, issuingOrganization: e.target.value })}
            error={errors.certification?.issuingOrganization}
            helpText="optional"
          />

          <div className="submit-cv__form-row">
            <Input
              label="Issue Date"
              type="date"
              value={currentCertification.issueDate}
              onChange={(e) => setCurrentCertification({ ...currentCertification, issueDate: e.target.value })}
              error={errors.certification?.issueDate}
              helpText="optional"
            />

            <Input
              label="Expiration Date"
              type="date"
              value={currentCertification.expirationDate}
              onChange={(e) => setCurrentCertification({ ...currentCertification, expirationDate: e.target.value })}
              error={errors.certification?.expirationDate}
              helpText="optional"
            />
          </div>

          <Button
            variant="secondary"
            icon={<Plus />}
            onClick={addCertification}
            className="submit-cv__add-button"
          >
            Add Certification
          </Button>
        </div>

        <Textarea
          label="Additional Information"
          placeholder="Languages, volunteer work, publications..."
          value={formData.customNotes}
          onChange={(e) => updateField('customNotes', e.target.value)}
          error={errors.customNotes}
          rows={4}
          helpText="optional"
        />
      </div>
    </div>
  )
}

function StepReview({ formData, setCurrentStep }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Review Your Information</h2>
      <p className="submit-cv__form-description">
        Please review your information before submitting
      </p>

      <div style={{ marginTop: 'var(--space-6)' }}>
        {/* Personal Info */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Personal Information</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <div className="submit-cv__review-item">
              <span className="submit-cv__review-label">Name:</span>
              <span className="submit-cv__review-value">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="submit-cv__review-item">
              <span className="submit-cv__review-label">Email:</span>
              <span className="submit-cv__review-value">{formData.email}</span>
            </div>
            {formData.phone && (
              <div className="submit-cv__review-item">
                <span className="submit-cv__review-label">Phone:</span>
                <span className="submit-cv__review-value">{formData.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Target */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Target Position</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
              Edit
            </Button>
          </div>
          <div className="submit-cv__review-content">
            <div className="submit-cv__review-item">
              <span className="submit-cv__review-label">Position:</span>
              <span className="submit-cv__review-value">{formData.targetPosition}</span>
            </div>
            {formData.targetCompany && (
              <div className="submit-cv__review-item">
                <span className="submit-cv__review-label">Company:</span>
                <span className="submit-cv__review-value">{formData.targetCompany}</span>
              </div>
            )}
            <div className="submit-cv__review-item">
              <span className="submit-cv__review-label">Priority:</span>
              <span className="submit-cv__review-value">{formData.priority}</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Experience ({formData.experiences.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
              Edit
            </Button>
          </div>
        </div>

        {/* Education */}
        <div className="submit-cv__review-section">
          <div className="submit-cv__review-header">
            <h3 className="submit-cv__review-title">Education ({formData.education.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>
              Edit
            </Button>
          </div>
        </div>

        {/* Skills */}
        {formData.skills.length > 0 && (
          <div className="submit-cv__review-section">
            <div className="submit-cv__review-header">
              <h3 className="submit-cv__review-title">Skills</h3>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)}>
                Edit
              </Button>
            </div>
            <div className="submit-cv__review-content">
              <div className="submit-cv__review-item">
                <span className="submit-cv__review-label">Skills:</span>
                <span className="submit-cv__review-value">{formData.skills.join(', ')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
