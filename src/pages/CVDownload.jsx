import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, FileText, ZoomIn, ZoomOut, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header/Header'
import { Card, CardHeader, CardBody } from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import { useToast } from '../contexts/ToastContext'
import './CVDownload.css'

const downloadOptions = [
  {
    id: 'pdf',
    name: 'PDF Document',
    format: '.pdf',
    icon: <FileText size={24} />,
    color: 'pdf',
  },
  {
    id: 'word',
    name: 'Word Document',
    format: '.docx',
    icon: <FileText size={24} />,
    color: 'word',
  },
  {
    id: 'latex',
    name: 'LaTeX Source',
    format: '.tex',
    icon: <FileText size={24} />,
    color: 'latex',
  },
]

export default function CVDownload() {
  const { id } = useParams()
  const { toast } = useToast()
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleZoomIn = () => {
    if (zoomLevel < 110) {
      setZoomLevel(zoomLevel + 10)
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 90) {
      setZoomLevel(zoomLevel - 10)
    }
  }

  const handleDownload = (format) => {
    toast.success(`Downloading CV as ${format}...`)
    // Mock download - in real app, this would trigger actual file download
    setTimeout(() => {
      toast.success(`${format} downloaded successfully!`)
    }, 1500)
  }

  const getZoomClass = () => {
    if (zoomLevel < 100) return 'cv-download__preview-content--zoom-out'
    if (zoomLevel > 100) return 'cv-download__preview-content--zoom-in'
    return ''
  }

  return (
    <>
      <Header />
      <div className="cv-download">
        <div className="cv-download__container">
          {/* Header */}
          <div className="cv-download__header">
            <Link to={`/chat/${id}`} className="cv-download__back">
              <ArrowLeft size={16} />
              Back to Chat
            </Link>

            <h1 className="cv-download__title">Your Completed CV</h1>
            <p className="cv-download__subtitle">
              Your professional CV is ready! Preview it below and download in your preferred format.
            </p>
          </div>

          {/* Main Content */}
          <div className="cv-download__content">
            {/* Preview Section */}
            <div className="cv-download__preview-section">
              {/* Preview Header */}
              <div className="cv-download__preview-header">
                <h2 className="cv-download__preview-title">Preview</h2>
                
                {/* Zoom Controls */}
                <div className="cv-download__zoom-controls">
                  <button
                    className="cv-download__zoom-btn"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 90}
                    aria-label="Zoom out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="cv-download__zoom-level">{zoomLevel}%</span>
                  <button
                    className="cv-download__zoom-btn"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 110}
                    aria-label="Zoom in"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>

              {/* Browser Mockup with CV Preview */}
              <motion.div
                className="cv-download__mockup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Chrome */}
                <div className="cv-download__mockup-chrome">
                  <div className="cv-download__mockup-dots">
                    <span className="cv-download__dot cv-download__dot--red" />
                    <span className="cv-download__dot cv-download__dot--yellow" />
                    <span className="cv-download__dot cv-download__dot--green" />
                  </div>
                  <div className="cv-download__mockup-title">John_Doe_CV.pdf</div>
                </div>

                {/* CV Preview Content */}
                <div className={`cv-download__preview-content ${getZoomClass()}`}>
                  <MockCV />
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="cv-download__sidebar">
              {/* Download Card */}
              <Card className="cv-download__download-card">
                <CardHeader
                  title="Download Your CV"
                  subtitle="Choose your preferred format"
                  withBorder
                />
                <CardBody>
                  <div className="cv-download__download-options">
                    {downloadOptions.map(option => (
                      <div
                        key={option.id}
                        className="cv-download__option"
                        onClick={() => handleDownload(option.name)}
                      >
                        <div className="cv-download__option-info">
                          <div className={`cv-download__option-icon cv-download__option-icon--${option.color}`}>
                            {option.icon}
                          </div>
                          <div className="cv-download__option-text">
                            <div className="cv-download__option-name">{option.name}</div>
                            <div className="cv-download__option-format">{option.format}</div>
                          </div>
                        </div>
                        <Download size={18} className="cv-download__option-arrow" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader title="Need Changes?" withBorder />
                <CardBody>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--color-text-secondary)', 
                    marginBottom: 'var(--space-4)',
                    lineHeight: 'var(--leading-relaxed)'
                  }}>
                    If you need any corrections or updates to your CV, you can request them through the chat.
                  </p>
                  <Link to={`/chat/${id}`} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 'var(--space-2)',
                    color: 'var(--color-deco-blue)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    transition: 'color var(--transition-fast)'
                  }}>
                    Open Chat
                    <ChevronRight size={16} />
                  </Link>
                </CardBody>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader title="Status" withBorder />
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Submission ID:
                      </span>
                      <Badge variant="info" size="sm">{id}</Badge>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        Status:
                      </span>
                      <Badge variant="completed" size="sm">Completed</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Mock CV Component
 * Represents a professional CV layout
 */
function MockCV() {
  return (
    <div className="cv-download__cv-mock">
      {/* Header */}
      <div className="cv-download__cv-header">
        <h1 className="cv-download__cv-name">JOHN DOE</h1>
        <div className="cv-download__cv-title">Senior Product Manager</div>
        <div className="cv-download__cv-contact">
          <span>john.doe@email.com</span>
          <span>•</span>
          <span>+1 (555) 123-4567</span>
          <span>•</span>
          <span>New York, NY</span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="cv-download__cv-section">
        <h2 className="cv-download__cv-section-title">Professional Summary</h2>
        <p className="cv-download__cv-item-description">
          Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to 
          deliver innovative SaaS products. Proven track record of driving product strategy, increasing user 
          engagement by 150%, and managing products from concept to launch. Expert in Agile methodologies, 
          data-driven decision making, and stakeholder management.
        </p>
      </div>

      {/* Experience */}
      <div className="cv-download__cv-section">
        <h2 className="cv-download__cv-section-title">Professional Experience</h2>
        
        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-header">
            <div className="cv-download__cv-item-title">Senior Product Manager</div>
            <div className="cv-download__cv-item-date">2020 - Present</div>
          </div>
          <div className="cv-download__cv-item-subtitle">Tech Corp, San Francisco, CA</div>
          <p className="cv-download__cv-item-description">
            Lead product development for enterprise SaaS platform serving 500K+ users. Drove 45% increase 
            in customer retention through data-driven feature prioritization and user research. Managed 
            cross-functional team of 12 engineers, designers, and analysts.
          </p>
        </div>

        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-header">
            <div className="cv-download__cv-item-title">Product Manager</div>
            <div className="cv-download__cv-item-date">2017 - 2020</div>
          </div>
          <div className="cv-download__cv-item-subtitle">StartupCo, New York, NY</div>
          <p className="cv-download__cv-item-description">
            Managed product roadmap for B2B marketing automation platform. Successfully launched 3 major 
            features resulting in 30% revenue growth. Conducted user interviews and A/B tests to optimize 
            product-market fit.
          </p>
        </div>

        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-header">
            <div className="cv-download__cv-item-title">Associate Product Manager</div>
            <div className="cv-download__cv-item-date">2015 - 2017</div>
          </div>
          <div className="cv-download__cv-item-subtitle">Digital Agency, Boston, MA</div>
          <p className="cv-download__cv-item-description">
            Assisted in product strategy and development for mobile applications. Collaborated with design 
            and engineering teams to deliver features on time. Analyzed user feedback and metrics to inform 
            product decisions.
          </p>
        </div>
      </div>

      {/* Education */}
      <div className="cv-download__cv-section">
        <h2 className="cv-download__cv-section-title">Education</h2>
        
        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-header">
            <div className="cv-download__cv-item-title">Master of Business Administration (MBA)</div>
            <div className="cv-download__cv-item-date">2015</div>
          </div>
          <div className="cv-download__cv-item-subtitle">Stanford University, Stanford, CA</div>
        </div>

        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-header">
            <div className="cv-download__cv-item-title">Bachelor of Science in Computer Science</div>
            <div className="cv-download__cv-item-date">2013</div>
          </div>
          <div className="cv-download__cv-item-subtitle">MIT, Cambridge, MA</div>
        </div>
      </div>

      {/* Skills */}
      <div className="cv-download__cv-section">
        <h2 className="cv-download__cv-section-title">Skills</h2>
        <div className="cv-download__cv-skills">
          <span className="cv-download__cv-skill">Product Strategy</span>
          <span className="cv-download__cv-skill">Agile/Scrum</span>
          <span className="cv-download__cv-skill">Data Analysis</span>
          <span className="cv-download__cv-skill">User Research</span>
          <span className="cv-download__cv-skill">Roadmap Planning</span>
          <span className="cv-download__cv-skill">Stakeholder Management</span>
          <span className="cv-download__cv-skill">A/B Testing</span>
          <span className="cv-download__cv-skill">SQL</span>
          <span className="cv-download__cv-skill">Jira</span>
          <span className="cv-download__cv-skill">Figma</span>
        </div>
      </div>

      {/* Certifications */}
      <div className="cv-download__cv-section">
        <h2 className="cv-download__cv-section-title">Certifications</h2>
        <div className="cv-download__cv-item">
          <div className="cv-download__cv-item-title">Certified Scrum Product Owner (CSPO)</div>
          <div className="cv-download__cv-item-title">Product Management Certificate - General Assembly</div>
        </div>
      </div>
    </div>
  )
}
