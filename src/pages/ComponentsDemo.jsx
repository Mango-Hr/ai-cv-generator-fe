import { useState } from 'react'
import { ArrowRight, Search, Mail, Sparkles, FileText, MessageCircle } from 'lucide-react'
import Button from '../components/shared/Button'
import { Input, Textarea, Select } from '../components/shared/Input'
import { Card, CardHeader, CardIcon, CardBody, CardFooter } from '../components/shared/Card'
import Badge from '../components/shared/Badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/shared/Modal'

/**
 * Components Demo Page
 * Showcases all Day 1 shared components
 */
export default function ComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    role: '',
  })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Shared Components Demo
      </h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>
        Day 1 Component Library - Matching landing page design system
      </p>

      {/* Buttons */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Buttons</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Variants</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>With Icons</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<ArrowRight />}>
              Build your CV
            </Button>
            <Button variant="secondary" icon={<Search />}>
              Search
            </Button>
            <Button variant="ghost" icon={<MessageCircle />}>
              Chat
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>States</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button disabled>Disabled</Button>
            <Button loading>Loading...</Button>
            <Button fullWidth style={{ maxWidth: '300px' }}>Full Width</Button>
          </div>
        </div>
      </section>

      {/* Form Inputs */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Form Inputs</h2>
        
        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            helpText="As it appears on official documents"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleInputChange}
            icon={<Mail />}
            required
          />

          <Input
            label="Search"
            placeholder="Search submissions..."
            icon={<Search />}
          />

          <Select
            label="Role"
            name="role"
            placeholder="Select a role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Sub-admin', value: 'sub_admin' },
              { label: 'Moderator', value: 'moderator' },
            ]}
            helpText="Select your user role"
          />

          <Textarea
            label="Message"
            name="message"
            placeholder="Enter your message here..."
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            helpText="Provide any additional details"
          />

          <Input
            label="With Error"
            placeholder="Invalid input"
            error="This field is required"
          />
        </div>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Cards</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Feature-style cards */}
          <Card hover accent="blue">
            <CardHeader>
              <CardIcon color="blue">
                <Sparkles />
              </CardIcon>
            </CardHeader>
            <CardBody>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                AI-Powered Content
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                OpenAI crafts professional, tailored CV content from your experience.
              </p>
            </CardBody>
          </Card>

          <Card hover accent="orange">
            <CardHeader>
              <CardIcon color="orange">
                <FileText />
              </CardIcon>
            </CardHeader>
            <CardBody>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Fixed Templates
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Consistent, pixel-perfect formatting every time.
              </p>
            </CardBody>
          </Card>

          <Card hover accent="purple">
            <CardHeader>
              <CardIcon color="purple">
                <MessageCircle />
              </CardIcon>
            </CardHeader>
            <CardBody>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Built-in Chat
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Communicate directly with the team processing your CV.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Card with header/body/footer */}
        <div style={{ marginTop: '1.5rem', maxWidth: '600px' }}>
          <Card>
            <CardHeader title="Submission Details" subtitle="View and manage submission" />
            <CardBody>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                This is a card with header, body, and footer. Perfect for detail views
                and forms in the admin panel.
              </p>
            </CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm">Cancel</Button>
              <Button size="sm">Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Badges</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            Status Variants
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Badge variant="new">New</Badge>
            <Badge variant="in-progress">In Progress</Badge>
            <Badge variant="review">Review</Badge>
            <Badge variant="completed">Completed</Badge>
            <Badge variant="urgent">Urgent</Badge>
            <Badge variant="active">Active</Badge>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
            With Dots
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Badge variant="success" dot>Success</Badge>
            <Badge variant="warning" dot>Warning</Badge>
            <Badge variant="error" dot>Error</Badge>
            <Badge variant="info" dot>Info</Badge>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </div>
      </section>

      {/* Modal */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="md">
          <ModalHeader title="Example Modal" onClose={() => setModalOpen(false)} />
          <ModalBody>
            <p style={{ marginBottom: '1rem' }}>
              This is a modal with backdrop blur and smooth scale + fade animations.
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              It prevents body scroll, can be closed with ESC key or overlay click,
              and follows the landing page design system.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </section>

      {/* Component Summary */}
      <section style={{ 
        background: 'var(--color-bg-secondary)', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)',
        marginTop: '4rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
          ✅ Day 1 Complete
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          All core components created and matching landing page design system:
        </p>
        <ul style={{ color: 'var(--color-text-secondary)', paddingLeft: '1.5rem' }}>
          <li>Button (4 variants, 3 sizes, loading state)</li>
          <li>Input / Textarea / Select (with labels, validation, help text)</li>
          <li>Card (with header, icon, body, footer, hover effects)</li>
          <li>Badge (status variants, dots, sizes)</li>
          <li>Modal (animations, backdrop blur, keyboard support)</li>
        </ul>
      </section>
    </div>
  )
}
