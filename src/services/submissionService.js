/**
 * Submission API Service
 * Handles all API calls related to CV submissions
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Create a new client submission
 * @param {Object} submissionData - The submission data
 * @returns {Promise<Object>} - Response from the API
 */
export const createSubmission = async (submissionData) => {
  try {
    const url = `${API_BASE_URL}/api/v1/public/submissions`
    console.log('Making submission request to:', url)
    console.log('API_BASE_URL:', API_BASE_URL)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      let error
      try {
        error = await response.json()
        throw new Error(error.message || `HTTP ${response.status}: Failed to create submission`)
      } catch (e) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    }

    const data = await response.json()
    console.log('Submission successful:', data)
    return data
  } catch (error) {
    console.error('Submission API Error:', error.message)
    console.error('Full error:', error)
    throw new Error(error.message || 'Failed to connect to backend. Please check your internet connection.')
  }
}

/**
 * Get submission status by ID
 * @param {string} submissionId - The submission ID
 * @returns {Promise<Object>} - Submission status and details
 */
export const getSubmissionStatus = async (submissionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/submissions/${submissionId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch submission status')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get Submission Status Error:', error)
    throw error
  }
}

/**
 * Download generated CV
 * @param {string} submissionId - The submission ID
 * @returns {Promise<Blob>} - PDF blob
 */
export const downloadCV = async (submissionId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/public/submissions/${submissionId}/download`
    )

    if (!response.ok) {
      throw new Error('Failed to download CV')
    }

    return await response.blob()
  } catch (error) {
    console.error('Download CV Error:', error)
    throw error
  }
}
