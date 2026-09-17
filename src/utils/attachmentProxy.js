const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ai-cv-generator-be-production.up.railway.app'

const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

/**
 * Build attachment proxy URL for client side
 */
export const buildClientAttachmentProxyUrl = (submissionId, publicId) => {
  if (!publicId || !submissionId) return null
  return `${API_BASE_URL}/api/v1/public/submissions/${encodeURIComponent(submissionId)}/attachments/proxy?public_id=${encodeURIComponent(publicId)}`
}

/**
 * Get the attachment proxy URL for client context
 */
export const getClientAttachmentProxyUrl = (attachment, submissionId) => {
  if (!attachment || !attachment.public_id || !submissionId) return null
  return buildClientAttachmentProxyUrl(submissionId, attachment.public_id)
}

function filenameFromPublicId(publicId) {
  if (!publicId) return null
  const parts = publicId.split('/')
  return parts[parts.length - 1] || null
}

function filenameFromContentDisposition(header) {
  if (!header) return null
  const match = header.match(/filename\*?=(?:UTF-8''|"?)([^"\s;]+)/i)
  return match ? decodeURIComponent(match[1].replace(/"/g, '')) : null
}

export const getAttachmentName = (attachment) =>
  attachment.original_filename ||
  attachment.original_name ||
  attachment.file_name ||
  attachment.filename ||
  attachment.name ||
  'Attachment'

async function fetchAttachmentBlob(proxyUrl, token, format) {
  const headers = {}
  if (token) {
    headers['X-Client-Access-Token'] = token
  }

  const response = await fetch(proxyUrl, { headers })

  if (!response.ok) {
    console.error("[AttachmentProxy] Response:", response.status, response.statusText);
    const errBody = await response.text().catch(() => "");
    console.error("[AttachmentProxy] Body:", errBody);
    throw new Error(`Failed to load attachment: ${response.status}`)
  }

  const rawBlob = await response.blob()

  const serverType = response.headers.get('content-type') || ''
  const knownMime = format && MIME_TYPES[format.toLowerCase()]
  const blob = (knownMime && !serverType.includes(knownMime))
    ? new Blob([rawBlob], { type: knownMime })
    : rawBlob

  const cd = response.headers.get('content-disposition')
  const headerName = filenameFromContentDisposition(cd)

  return { blob, fileName: headerName }
}

export async function openAttachment(submissionId, publicId, format, token) {
  const proxyUrl = buildClientAttachmentProxyUrl(submissionId, publicId)
  if (!proxyUrl) return

  try {
    const { blob } = await fetchAttachmentBlob(proxyUrl, token, format)
    const objectUrl = URL.createObjectURL(blob)
    const ext = (format || '').toLowerCase()

    if (ext === 'pdf' || (MIME_TYPES[ext] && MIME_TYPES[ext].startsWith('image/'))) {
      openInOverlay(objectUrl, ext)
    } else {
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filenameFromPublicId(publicId) || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    }
  } catch (error) {
    console.error('[AttachmentProxy] Failed to open attachment:', error)
  }
}

function openInOverlay(objectUrl, ext) {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  })

  const closeBtn = document.createElement('button')
  closeBtn.textContent = '\u2715 Close'
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 16px',
    background: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: '1',
  })
  closeBtn.onclick = () => {
    document.body.removeChild(overlay)
    URL.revokeObjectURL(objectUrl)
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay)
      URL.revokeObjectURL(objectUrl)
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)

  if (ext === 'pdf') {
    const iframe = document.createElement('iframe')
    iframe.src = objectUrl
    Object.assign(iframe.style, {
      width: '90vw',
      height: '90vh',
      border: 'none',
      borderRadius: '8px',
      background: 'white',
    })
    overlay.appendChild(closeBtn)
    overlay.appendChild(iframe)
  } else {
    const img = document.createElement('img')
    img.src = objectUrl
    Object.assign(img.style, {
      maxWidth: '90vw',
      maxHeight: '85vh',
      borderRadius: '8px',
      objectFit: 'contain',
    })
    overlay.appendChild(closeBtn)
    overlay.appendChild(img)
  }

  document.body.appendChild(overlay)
}

export async function downloadAttachment(submissionId, publicId, fileName, format, token) {
  const proxyUrl = buildClientAttachmentProxyUrl(submissionId, publicId)
  if (!proxyUrl) return

  try {
    const { blob, fileName: headerFileName } = await fetchAttachmentBlob(proxyUrl, token, format)
    let downloadName = fileName || headerFileName || filenameFromPublicId(publicId) || 'download'

    if (format && !downloadName.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
      downloadName = `${downloadName}.${format.toLowerCase()}`
    }

    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = downloadName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('[AttachmentProxy] Failed to download attachment:', error)
  }
}
