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
    console.log('ClientChat mounted with submissionId:', submissionId)
    console.log('Checking localStorage for submission data...')
    
    if (!submissionId) {
      console.error('No submissionId in URL!')
      setError('Submission not found. Please build your resume first.')
      return
    }
    
    const key = `submission_${submissionId}`
    console.log('Looking for localStorage key:', key)
    const stored = localStorage.getItem(key)
    
    console.log('localStorage value:', stored ? `Found (${stored.length} chars)` : 'NOT FOUND')
    console.log('Available localStorage keys:', Object.keys(localStorage).filter(k => k.includes('submission')))
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Parsed data:', { access_token: parsed.access_token ? '✓' : '✗', first_name: parsed.first_name, last_name: parsed.last_name })
        const { access_token, first_name, last_name } = parsed
        setAccessToken(access_token)
        setClientName(`${first_name} ${last_name}`.trim() || 'You')
        console.log('✅ Access token set, client name:', `${first_name} ${last_name}`)
      } catch (err) {
        console.error('❌ Error parsing stored submission data:', err)
        setError('Failed to parse session data')
      }
    } else {
      console.error('❌ No data found in localStorage for key:', key)
      setError('Submission not found. Please build your resume first.')
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
                onClick={() => navigate('/my-submissions')}
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
                Build Your Resume
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
            <h1 className="client-chat__title">Chat About Your Resume</h1>
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
