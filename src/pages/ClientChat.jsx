import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Hash, Clock, Info } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import Header from '../components/Header/Header'
import { ChatBubble, ChatInput } from '../components/shared/Chat'
import Badge from '../components/shared/Badge'
import EmptyState from '../components/shared/EmptyState'
import { useToast } from '../contexts/ToastContext'
import './ClientChat.css'

// Mock data
const mockMessages = [
  {
    id: 1,
    sender: 'admin',
    senderName: 'Sarah Johnson',
    senderAvatar: null,
    message: 'Hello! Thank you for submitting your CV. I\'ll be helping you today.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 2,
    sender: 'client',
    senderName: 'You',
    message: 'Thank you! When can I expect the completed CV?',
    timestamp: new Date(Date.now() - 86400000 * 2 + 600000).toISOString(),
  },
  {
    id: 3,
    sender: 'admin',
    senderName: 'Sarah Johnson',
    message: 'We typically complete CVs within 2-3 business days. I\'ll start working on yours today!',
    timestamp: new Date(Date.now() - 86400000 * 2 + 1200000).toISOString(),
  },
  {
    id: 4,
    sender: 'admin',
    senderName: 'Sarah Johnson',
    message: 'Just to confirm, you\'re targeting a Senior Product Manager role at a tech company, correct?',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 5,
    sender: 'client',
    senderName: 'You',
    message: 'Yes, that\'s correct. Preferably at a mid-sized SaaS company.',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  },
]

export default function ClientChat() {
  const { id } = useParams()
  const { toast } = useToast()
  const [messages, setMessages] = useState(mockMessages)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async ({ message, attachment }) => {
    // Add client message
    const newMessage = {
      id: messages.length + 1,
      sender: 'client',
      senderName: 'You',
      message,
      attachment,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage])

    // Simulate admin typing
    setIsTyping(true)
    
    // Simulate admin response after 2 seconds
    setTimeout(() => {
      setIsTyping(false)
      
      const adminResponse = {
        id: messages.length + 2,
        sender: 'admin',
        senderName: 'Sarah Johnson',
        message: 'Thank you for the information! I\'ll update your CV accordingly.',
        timestamp: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, adminResponse])
      toast.success('Message sent')
    }, 2000)
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach(msg => {
      const date = new Date(msg.timestamp)
      let dateKey
      
      if (isToday(date)) {
        dateKey = 'Today'
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday'
      } else {
        dateKey = format(date, 'MMMM d, yyyy')
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(msg)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <>
      <Header />
      <div className="client-chat">
        <div className="client-chat__container">
          {/* Header */}
          <div className="client-chat__header">
            <Link to="/" className="client-chat__back">
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <h1 className="client-chat__title">Chat with Team</h1>

            <div className="client-chat__meta">
              <div className="client-chat__meta-item">
                <Hash size={16} className="client-chat__meta-icon" />
                <span>Submission ID: {id}</span>
              </div>
              <div className="client-chat__meta-item">
                <Clock size={16} className="client-chat__meta-icon" />
                <Badge variant="in-progress" size="sm">In Progress</Badge>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="client-chat__info-banner">
            <Info size={20} className="client-chat__info-icon" />
            <div className="client-chat__info-content">
              <div className="client-chat__info-title">Direct Communication</div>
              <p className="client-chat__info-text">
                Use this chat to ask questions, provide additional context, or request changes.
                Our team typically responds within a few hours.
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="client-chat__window">
            {/* Messages Area */}
            <div className="client-chat__messages">
              {messages.length === 0 ? (
                <div className="client-chat__empty">
                  <EmptyState
                    icon={<Info />}
                    title="No messages yet"
                    description="Start a conversation with the team"
                    compact
                  />
                </div>
              ) : (
                <>
                  {Object.entries(messageGroups).map(([date, msgs]) => (
                    <div key={date}>
                      {/* Date Divider */}
                      <div className="client-chat__date-divider">
                        <span>{date}</span>
                      </div>

                      {/* Messages */}
                      {msgs.map(msg => (
                        <ChatBubble
                          key={msg.id}
                          sender={msg.sender}
                          senderName={msg.senderName}
                          senderAvatar={msg.senderAvatar}
                          message={msg.message}
                          timestamp={msg.timestamp}
                          attachment={msg.attachment}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="client-chat__typing">
                      <div className="client-chat__typing-dot" />
                      <div className="client-chat__typing-dot" />
                      <div className="client-chat__typing-dot" />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="client-chat__input-area">
              <ChatInput
                onSend={handleSendMessage}
                placeholder="Type your message..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
