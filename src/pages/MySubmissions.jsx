import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Edit2, Trash2, Plus } from 'lucide-react'
import Header from '../components/Header/Header'
import Button from '../components/shared/Button'
import './MySubmissions.css'

export default function MySubmissions() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load submissions from localStorage
  useEffect(() => {
    const loadSubmissions = () => {
      try {
        const allSubmissions = []
        
        // Iterate through all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          
          // Only process submission keys
          if (key.startsWith('submission_')) {
            const data = JSON.parse(localStorage.getItem(key))
            const submissionId = key.replace('submission_', '')
            
            allSubmissions.push({
              id: submissionId,
              key: key,
              ...data,
              created_at: data.created_at || new Date().toISOString()
            })
          }
        }
        
        // Sort by most recent first
        allSubmissions.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
        
        setSubmissions(allSubmissions)
        console.log('Loaded submissions:', allSubmissions.length)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  const handleResumeForm = (submissionId) => {
    navigate(`/submit?resume=${submissionId}`)
  }

  const handleViewChat = (submissionId) => {
    navigate(`/chat/${submissionId}`)
  }

  const handleDeleteClick = (submissionId) => {
    setDeleteConfirm(submissionId)
  }

  const handleConfirmDelete = (submissionId) => {
    try {
      const key = `submission_${submissionId}`
      localStorage.removeItem(key)
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      setDeleteConfirm(null)
      console.log('Deleted submission:', submissionId)
    } catch (error) {
      console.error('Error deleting submission:', error)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleNewResume = () => {
    navigate('/submit')
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown date'
    }
  }

  return (
    <>
      <Header />
      <div className="my-submissions">
        <div className="my-submissions__container">
          {/* Header */}
          <div className="my-submissions__header">
            <Button
              variant="ghost"
              icon={<ArrowLeft />}
              onClick={() => navigate('/')}
              title="Go back to home"
            >
              Back
            </Button>
            <h1 className="my-submissions__title">My Submissions</h1>
            <div style={{ width: '100px' }} /> {/* Spacer for alignment */}
          </div>

          {/* Action Bar */}
          <div className="my-submissions__action-bar">
            <Button
              variant="primary"
              icon={<Plus />}
              onClick={handleNewResume}
            >
              Create New Resume
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="my-submissions__loading">
              <p>Loading submissions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && submissions.length === 0 && (
            <div className="my-submissions__empty">
              <h2>No submissions yet</h2>
              <p>Create your first resume to get started</p>
              <Button
                variant="primary"
                onClick={handleNewResume}
              >
                Build Your First Resume
              </Button>
            </div>
          )}

          {/* Submissions List */}
          {!loading && submissions.length > 0 && (
            <div className="my-submissions__list">
              {submissions.map(submission => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-card__content">
                    <div className="submission-card__header">
                      <h3 className="submission-card__name">
                        {submission.first_name} {submission.last_name}
                      </h3>
                      <span className="submission-card__date">
                        {formatDate(submission.created_at)}
                      </span>
                    </div>

                    <p className="submission-card__email">
                      {submission.email}
                    </p>

                    {submission.phone && (
                      <p className="submission-card__phone">
                        {submission.phone}
                      </p>
                    )}
                  </div>

                  <div className="submission-card__actions">
                    <button
                      className="submission-card__button submission-card__button--chat"
                      onClick={() => handleViewChat(submission.id)}
                      title="View chat for this submission"
                    >
                      <MessageSquare size={18} />
                      <span>Chat</span>
                    </button>

                    <button
                      className="submission-card__button submission-card__button--edit"
                      onClick={() => handleResumeForm(submission.id)}
                      title="Edit this submission"
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="submission-card__button submission-card__button--delete"
                      onClick={() => handleDeleteClick(submission.id)}
                      title="Delete this submission"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={handleCancelDelete}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal__title">Delete Submission?</h2>
              <p className="modal__message">
                Are you sure you want to delete this submission? This action cannot be undone.
              </p>
              <div className="modal__actions">
                <Button
                  variant="secondary"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleConfirmDelete(deleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
