/**
 * Build attachment proxy URL for client side
 * @param {string} submissionId - The submission ID
 * @param {string} publicId - The attachment public_id from backend
 * @returns {string} Proxy URL for opening/downloading the attachment
 */
export const buildClientAttachmentProxyUrl = (submissionId, publicId) => {
  if (!publicId || !submissionId) return null
  return `/api/v1/public/submissions/${encodeURIComponent(submissionId)}/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
}

/**
 * Get the attachment proxy URL for client context
 * @param {Object} attachment - Attachment object with public_id and other fields
 * @param {string} submissionId - Required for building the URL
 * @returns {string} Proxy URL
 */
export const getClientAttachmentProxyUrl = (attachment, submissionId) => {
  if (!attachment || !attachment.public_id || !submissionId) return null
  return buildClientAttachmentProxyUrl(submissionId, attachment.public_id)
}
