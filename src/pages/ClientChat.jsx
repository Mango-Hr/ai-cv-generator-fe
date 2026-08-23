import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/Header/Header'
import Chat from '../components/Chat'
import Button from '../components/shared/Button'
import './ClientChat.css'

export default function ClientChat() {
  const { id: submissionId } = useParams()
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState(null)
  const [clientName, setClientName] = useState('You')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Retrieve access token and client info from localStorage
    const stored = localStorage.getItem(`submission_${submissionId}`)
    
    if (stored) {
      try {
        const { access_token, first_name, last_name } = JSON.parse(stored)
        setAccessToken(access_token)
        setClientName(`${first_name} ${last_name}`.trim() || 'You')
      } catch (err) {
        console.error('Error parsing stored submission data:', err)
        setError('Failed to load submission data. Please try submitting your CV again.')
      }
    } else {
      setError('Submission not found. Please submit your CV first.')
    }
  }, [submissionId])

  if (error) {
    return (
      <>
        <Header />
        <div className="client-chat">
          <div className="client-chat__container">
            <div className="client-chat__header">
              <Button
                variant="ghost"
                icon={<ArrowLeft />}
                onClick={() => navigate('/')}
              >
                Back
              </Button>
            </div>

            <div className="client-chat__error">
              <h2>Unable to Load Chat</h2>
              <p>{error}</p>
              <Button
                variant="primary"
                onClick={() => navigate('/submit')}
              >
                Submit CV
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="client-chat">
        <div className="client-chat__container">
          {/* Header */}
          <div className="client-chat__header">
            <Button
              variant="ghost"
              icon={<ArrowLeft />}
              onClick={() => navigate('/')}
              title="Go back"
            >
              Back
            </Button>
            <h1 className="client-chat__title">Chat with Support</h1>
            <div style={{ width: '100px' }} /> {/* Spacer for alignment */}
          </div>

          {/* Chat Component */}
          {accessToken ? (
            <div className="client-chat__content">
              <Chat
                submissionId={submissionId}
                accessToken={accessToken}
                userName={clientName}
              />
            </div>
          ) : (
            <div className="client-chat__loading">
              <p>Loading chat...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
