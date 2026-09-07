/**
 * Submission API Service
 * Handles all API calls related to CV submissions, file uploads and documents.
 *
 * Backend contract (live OpenAPI):
 *  - POST   /api/v1/public/submissions                      Create submission (JSON)
 *  - POST   /api/v1/public/upload                           Upload files to Cloudinary (multipart)
 *  - GET    /api/v1/public/submissions/:id                  Get submission status   (X-Client-Access-Token required)
 *  - GET    /api/v1/public/submissions/:id/documents        List generated CV documents (token required)
 *  - GET    /api/v1/public/submissions/:id/documents/:docId/download  Download a document (token required)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/** Standard headers for client-authenticated endpoints. */
const clientHeaders = (accessToken) => ({
  'X-Client-Access-Token': accessToken,
  'Content-Type': 'application/json',
})

/** Build a readable message from a FastAPI error body (detail may be a string or a 422 array). */
const extractErrorMessage = (data, fallback) => {
  if (!data) return fallback
  const detail = data.detail ?? data.message
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map(d => {
        const loc = Array.isArray(d.loc) ? d.loc.join('.') : d.loc
        return loc ? `${loc}: ${d.msg}` : d.msg
      })
      .join('; ')
  }
  return JSON.stringify(detail)
}

/**
 * Recursively collect file URLs from an untyped upload response.
 * The backend documents the upload response as "returns CDN secure_url and metadata",
 * so we defensively walk the JSON looking for common URL keys.
 */
const collectUrls = (node, urls = []) => {
  if (!node || typeof node !== 'object') return urls
  if (Array.isArray(node)) {
    node.forEach(item => collectUrls(item, urls))
    return urls
  }
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string' && /^https?:\/\//.test(value) &&
        ['secure_url', 'url', 'file_url', 'cdn_url', 'link'].includes(key)) {
      urls.push(value)
    } else if (value && typeof value === 'object') {
      collectUrls(value, urls)
    }
  }
  return urls
}

/**
 * Upload a document/media file to Cloudinary via the backend.
 * @param {File} file - The file to upload
 * @param {string} [folder] - Optional destination folder (e.g. 'resumes')
 * @returns {Promise<{urls: string[], primary: string|null, raw: Object}>}
 */
export const uploadFile = async (file, folder = null) => {
  try {
    const formData = new FormData()
    formData.append('files', file)
    if (folder) {
      formData.append('folder', folder)
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/public/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let data = null
      try { data = await response.json() } catch { /* ignore parse errors */ }
      throw new Error(extractErrorMessage(data, `HTTP ${response.status}: Failed to upload file`))
    }

    const raw = await response.json()
    const urls = collectUrls(raw)
    return { urls, primary: urls[0] || null, raw }
  } catch (error) {
    console.error('Upload File Error:', error)
    throw new Error(error.message || 'Failed to upload file. Please check your connection and try again.', { cause: error })
  }
}

/**
 * Create a new client submission
 * @param {Object} submissionData - Payload matching the CreateSubmission schema
 * @returns {Promise<Object>} - Response from the API
 */
export const createSubmission = async (submissionData) => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/submissions`
    console.log('Making submission request to:', url)
    console.log('Submission payload:', JSON.stringify(submissionData, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    if (!response.ok) {
      let data = null
      try { data = await response.json() } catch { /* ignore parse errors */ }
      console.error('Backend error response:', data)
      throw new Error(extractErrorMessage(data, `HTTP ${response.status}: Failed to create submission`))
    }

    const data = await response.json()
    console.log('Submission successful:', data)
    return data
  } catch (error) {
    console.error('Submission API Error:', error.message)
    throw new Error(error.message || 'Failed to connect to backend. Please check your internet connection.', { cause: error })
  }
}

/**
 * Get submission status by ID
 * @param {string} submissionId - The submission ID
 * @param {string} accessToken - Client access token (required by the backend)
 * @returns {Promise<Object>} - Submission status and details
 */
export const getSubmissionStatus = async (submissionId, accessToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/submissions/${submissionId}`,
      { headers: clientHeaders(accessToken) }
    )

    if (!response.ok) {
      let data = null
      try { data = await response.json() } catch { /* ignore parse errors */ }
      throw new Error(extractErrorMessage(data, `Failed to fetch submission status (HTTP ${response.status})`))
    }

    return await response.json()
  } catch (error) {
    console.error('Get Submission Status Error:', error)
    throw error
  }
}

/**
 * List all generated CV documents for a submission
 * @param {string} submissionId - The submission ID
 * @param {string} accessToken - Client access token
 * @returns {Promise<Object>} - Document list payload
 */
export const listDocuments = async (submissionId, accessToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/submissions/${submissionId}/documents`,
      { headers: clientHeaders(accessToken) }
    )

    if (!response.ok) {
      let data = null
      try { data = await response.json() } catch { /* ignore parse errors */ }
      throw new Error(extractErrorMessage(data, `Failed to list documents (HTTP ${response.status})`))
    }

    return await response.json()
  } catch (error) {
    console.error('List Documents Error:', error)
    throw error
  }
}

/**
 * Download a generated CV document as a binary file (returns a Blob)
 * @param {string} submissionId - The submission ID
 * @param {string} documentId - The document ID
 * @param {string} accessToken - Client access token
 * @returns {Promise<Blob>}
 */
export const downloadDocument = async (submissionId, documentId, accessToken) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/submissions/${submissionId}/documents/${documentId}/download`,
      { headers: { 'X-Client-Access-Token': accessToken } }
    )

    if (!response.ok) {
      throw new Error(`Failed to download document (HTTP ${response.status})`)
    }

    return await response.blob()
  } catch (error) {
    console.error('Download Document Error:', error)
    throw error
  }
}
