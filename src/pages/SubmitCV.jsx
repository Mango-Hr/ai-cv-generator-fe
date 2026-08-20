import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, ArrowRight, Plus, X, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header/Header'
import Button from '../components/shared/Button'
import { Input, Textarea, Select } from '../components/shared/Input'
import FileUpload from '../components/shared/FileUpload'
import { useToast } from '../contexts/ToastContext'
import './SubmitCV.css'

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Job Target' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Education' },
  { id: 5, label: 'Skills' },
  { id: 6, label: 'Review' },
]

export default function SubmitCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    location: '',
    
    // Job Target
    targetPosition: '',
    jobDescription: '',
    existingCV: null,
    
    // Experience
    experiences: [],
    
    // Education
    education: [],
    
    // Skills
    skills: '',
    certifications: '',
    additionalInfo: '',
  })

  const [currentExperience, setCurrentExperience] = useState({
    company: '',
    role: '',
    duration: '',
    description: '',
  })

  const [currentEducation, setCurrentEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    year: '',
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addExperience = () => {
    if (!currentExperience.company || !currentExperience.role) {
      toast.error('Please fill in required experience fields')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { ...currentExperience, id: Date.now() }]
    }))
    
    setCurrentExperience({ company: '', role: '', duration: '', description: '' })
    toast.success('Experience added')
  }

  const removeExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    if (!currentEducation.institution || !currentEducation.degree) {
      toast.error('Please fill in required education fields')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { ...currentEducation, id: Date.now() }]
    }))
    
    setCurrentEducation({ institution: '', degree: '', field: '', year: '' })
    toast.success('Education added')
  }

  const removeEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.email) {
          toast.error('Please fill in all required fields')
          return false
        }
        break
      case 2:
        if (!formData.targetPosition) {
          toast.error('Please enter your target position')
          return false
        }
        break
      case 3:
        if (formData.experiences.length === 0) {
          toast.warning('Consider adding at least one work experience')
        }
        break
      case 4:
        if (formData.education.length === 0) {
          toast.warning('Consider adding at least one education entry')
        }
        break
    }
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
    }
  }

  const handleSubmit = async () => {
    // Mock API call
    toast.info('Submitting your CV...')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock submission ID
    const submissionId = 'CV-' + Math.floor(Math.random() * 10000)
    
    toast.success('CV submitted successfully!')
    navigate(`/submit/success?id=${submissionId}`)
  }

  const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <>
      <Header />
      <div className="submit-cv">
        <div className="submit-cv__container">
          {/* Header */}
          <div className="submit-cv__header">
            <h1 className="submit-cv__title">Submit Your CV</h1>
            <p className="submit-cv__subtitle">
              Fill in your information and let our AI craft a professional CV tailored to your target role
            </p>
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
                <StepPersonalInfo formData={formData} updateField={updateField} />
              )}
              
              {currentStep === 2 && (
                <StepJobTarget formData={formData} updateField={updateField} />
              )}
              
              {currentStep === 3 && (
                <StepExperience
                  experiences={formData.experiences}
                  currentExperience={currentExperience}
                  setCurrentExperience={setCurrentExperience}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                />
              )}
              
              {currentStep === 4 && (
                <StepEducation
                  education={formData.education}
                  currentEducation={currentEducation}
                  setCurrentEducation={setCurrentEducation}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                />
              )}
              
              {currentStep === 5 && (
                <StepSkills formData={formData} updateField={updateField} />
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
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={handleSubmit}
                    >
                      Submit CV
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
function StepPersonalInfo({ formData, updateField }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Personal Information</h2>
      <p className="submit-cv__form-description">
        Let's start with your basic information
      </p>

      <div className="submit-cv__form-fields">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          required
        />

        <div className="submit-cv__form-row">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>

        <Input
          label="Location"
          placeholder="New York, NY"
          value={formData.location}
          onChange={(e) => updateField('location', e.target.value)}
          helpText="City and state/country"
        />
      </div>
    </div>
  )
}

function StepJobTarget({ formData, updateField }) {
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
          required
          helpText="The role you're targeting"
        />

        <Textarea
          label="Job Description"
          placeholder="Paste the job description here..."
          value={formData.jobDescription}
          onChange={(e) => updateField('jobDescription', e.target.value)}
          rows={8}
          helpText="Paste the full job description to help our AI tailor your CV"
        />

        <div>
          <label className="input-label" style={{ marginBottom: 'var(--space-2)' }}>
            Existing CV (Optional)
          </label>
          <FileUpload
            accept=".pdf,.docx,.doc"
            maxSize={5}
            onUpload={(files) => updateField('existingCV', files[0])}
            helpText="Upload your current CV if you have one (PDF or Word)"
          />
        </div>
      </div>
    </div>
  )
}

function StepExperience({ experiences, currentExperience, setCurrentExperience, addExperience, removeExperience }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Work Experience</h2>
      <p className="submit-cv__form-description">
        Add your relevant work experience
      </p>

      <div className="submit-cv__form-fields">
        {/* Existing experiences */}
        {experiences.length > 0 && (
          <div className="submit-cv__items-list">
            {experiences.map(exp => (
              <div key={exp.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{exp.role}</div>
                    <div className="submit-cv__item-subtitle">
                      {exp.company} • {exp.duration}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeExperience(exp.id)}
                    className="submit-cv__item-remove"
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
        <Input
          label="Company Name"
          placeholder="Tech Corp"
          value={currentExperience.company}
          onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
        />

        <div className="submit-cv__form-row">
          <Input
            label="Job Title"
            placeholder="Product Manager"
            value={currentExperience.role}
            onChange={(e) => setCurrentExperience({ ...currentExperience, role: e.target.value })}
          />

          <Input
            label="Duration"
            placeholder="2020-2023"
            value={currentExperience.duration}
            onChange={(e) => setCurrentExperience({ ...currentExperience, duration: e.target.value })}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Describe your responsibilities and achievements..."
          value={currentExperience.description}
          onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
          rows={4}
        />

        <Button
          variant="secondary"
          icon={<Plus />}
          onClick={addExperience}
          className="submit-cv__add-button"
        >
          Add Experience
        </Button>
      </div>
    </div>
  )
}

function StepEducation({ education, currentEducation, setCurrentEducation, addEducation, removeEducation }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Education</h2>
      <p className="submit-cv__form-description">
        Add your educational background
      </p>

      <div className="submit-cv__form-fields">
        {/* Existing education */}
        {education.length > 0 && (
          <div className="submit-cv__items-list">
            {education.map(edu => (
              <div key={edu.id} className="submit-cv__item-card">
                <div className="submit-cv__item-header">
                  <div>
                    <div className="submit-cv__item-title">{edu.degree}</div>
                    <div className="submit-cv__item-subtitle">
                      {edu.institution} {edu.field && `• ${edu.field}`} {edu.year && `• ${edu.year}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => removeEducation(edu.id)}
                    className="submit-cv__item-remove"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new education form */}
        <Input
          label="Institution"
          placeholder="University of Technology"
          value={currentEducation.institution}
          onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
        />

        <div className="submit-cv__form-row">
          <Input
            label="Degree"
            placeholder="Bachelor of Science"
            value={currentEducation.degree}
            onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
          />

          <Input
            label="Field of Study"
            placeholder="Computer Science"
            value={currentEducation.field}
            onChange={(e) => setCurrentEducation({ ...currentEducation, field: e.target.value })}
          />
        </div>

        <Input
          label="Year"
          placeholder="2020"
          value={currentEducation.year}
          onChange={(e) => setCurrentEducation({ ...currentEducation, year: e.target.value })}
        />

        <Button
          variant="secondary"
          icon={<Plus />}
          onClick={addEducation}
          className="submit-cv__add-button"
        >
          Add Education
        </Button>
      </div>
    </div>
  )
}

function StepSkills({ formData, updateField }) {
  return (
    <div className="submit-cv__form-card">
      <h2 className="submit-cv__form-title">Skills & Additional Info</h2>
      <p className="submit-cv__form-description">
        Add your skills, certifications, and any additional information
      </p>

      <div className="submit-cv__form-fields">
        <Textarea
          label="Skills"
          placeholder="Product Strategy, Agile, Stakeholder Management..."
          value={formData.skills}
          onChange={(e) => updateField('skills', e.target.value)}
          rows={4}
          helpText="List your relevant skills, separated by commas"
        />

        <Textarea
          label="Certifications"
          placeholder="PMP, Scrum Master, AWS Certified..."
          value={formData.certifications}
          onChange={(e) => updateField('certifications', e.target.value)}
          rows={3}
          helpText="Any professional certifications you hold"
        />

        <Textarea
          label="Additional Information"
          placeholder="Languages, volunteer work, publications..."
          value={formData.additionalInfo}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          rows={4}
          helpText="Any other relevant information"
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
              <span className="submit-cv__review-label">Full Name:</span>
              <span className="submit-cv__review-value">{formData.fullName}</span>
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
            {formData.location && (
              <div className="submit-cv__review-item">
                <span className="submit-cv__review-label">Location:</span>
                <span className="submit-cv__review-value">{formData.location}</span>
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
            {formData.jobDescription && (
              <div className="submit-cv__review-item">
                <span className="submit-cv__review-label">Job Description:</span>
                <span className="submit-cv__review-value">
                  {formData.jobDescription.substring(0, 150)}...
                </span>
              </div>
            )}
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
        {formData.skills && (
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
                <span className="submit-cv__review-value">{formData.skills}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
