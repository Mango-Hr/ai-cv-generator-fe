import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, MessageCircle, ArrowRight, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import Header from '../components/Header/Header'
import Button from '../components/shared/Button'
import { Card, CardBody } from '../components/shared/Card'
import { useToast } from '../contexts/ToastContext'
import './SubmissionSuccess.css'

export default function SubmissionSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const submissionId = searchParams.get('id') || 'CV-XXXX'

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  const copySubmissionId = () => {
    navigator.clipboard.writeText(submissionId)
    toast.success('Submission ID copied to clipboard')
  }

  const handleGoToChat = () => {
    navigate(`/chat/${submissionId}`)
  }

  return (
    <>
      <Header />
      <div className="submission-success">
        <div className="submission-success__container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success Icon */}
            <div className="submission-success__icon">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={64} />
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="submission-success__title">
              Resume Built Successfully!
            </h1>

            <p className="submission-success__description">
              Your resume submission has been received. Our team will review it and start crafting
              your professional resume tailored to your target role.
            </p>

            {/* Submission ID Card */}
            {/* <Card className="submission-success__id-card">
              <CardBody>
                <div className="submission-success__id">
                  <div>
                    <div className="submission-success__id-label">Your Submission ID</div>
                    <div className="submission-success__id-value">{submissionId}</div>
                    <div className="submission-success__id-hint">
                      Save this ID to track your submission
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Copy />}
                    onClick={copySubmissionId}
                  >
                    Copy
                  </Button>
                </div>
              </CardBody>
            </Card> */}

            {/* Next Steps */}
            <div className="submission-success__steps">
              <h2 className="submission-success__steps-title">What Happens Next?</h2>
              
              <div className="submission-success__steps-list">
                <div className="submission-success__step">
                  <div className="submission-success__step-number">1</div>
                  <div className="submission-success__step-content">
                    <h3 className="submission-success__step-title">Review</h3>
                    <p className="submission-success__step-description">
                      Our team will review your submission and may reach out if we need any clarification
                    </p>
                  </div>
                </div>

                <div className="submission-success__step">
                  <div className="submission-success__step-number">2</div>
                  <div className="submission-success__step-content">
                    <h3 className="submission-success__step-title">AI Processing</h3>
                    <p className="submission-success__step-description">
                      Our AI will craft professional content tailored to your target position
                    </p>
                  </div>
                </div>

                <div className="submission-success__step">
                  <div className="submission-success__step-number">3</div>
                  <div className="submission-success__step-content">
                    <h3 className="submission-success__step-title">Template Formatting</h3>
                    <p className="submission-success__step-description">
                      Your content will be formatted in our professional template
                    </p>
                  </div>
                </div>

                <div className="submission-success__step">
                  <div className="submission-success__step-number">4</div>
                  <div className="submission-success__step-content">
                    <h3 className="submission-success__step-title">Delivery</h3>
                    <p className="submission-success__step-description">
                      You'll receive your completed resume as PDF, Word, and LaTeX
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="submission-success__cta">
              <div className="submission-success__cta-content">
                <MessageCircle size={32} className="submission-success__cta-icon" />
                <div>
                  <h3 className="submission-success__cta-title">Have Questions?</h3>
                  <p className="submission-success__cta-description">
                    Use our built-in chat to communicate with the team building your resume
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={<MessageCircle />}
                iconPosition="right"
                onClick={handleGoToChat}
              >
                Open Chat
              </Button>
            </div>

            {/* Footer Actions */}
            <div className="submission-success__footer">
              <Button
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
