async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (response.ok) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string') {
      throw new Error(payload.message)
    }

    const firstError = Object.values(payload).find((value) => typeof value === 'string')
    if (firstError) {
      throw new Error(firstError)
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    throw new Error(payload)
  }

  throw new Error('Something went wrong while contacting the server.')
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  return parseResponse(response)
}
