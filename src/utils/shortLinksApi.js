export async function readShortLinksResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new Error(
      `The short-link service returned an unexpected response (HTTP ${response.status}). ` +
      'On the live site, check that the shortLinks function and Firebase Hosting rewrites are deployed. ' +
      'For local testing, restart the Vite dev server.'
    )
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(`The short-link service returned invalid JSON (HTTP ${response.status}).`)
  }

  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('The short-link service returned an invalid response.')
  }
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : `The short-link request failed (HTTP ${response.status}).`)
  }
  return result
}
