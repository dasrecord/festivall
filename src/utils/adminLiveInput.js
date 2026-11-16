import { festivall_auth } from '@/firebase.js'

export async function sendAdminLiveInput(kind, input) {
  const user = festivall_auth.currentUser
  if (!user) throw new Error('Admin login required')
  const projectId = import.meta.env.VITE_APP_REUNION_PROJECT_ID
  if (!projectId) throw new Error('Reunion Firebase project is not configured')
  const token = await user.getIdToken()
  const response = await fetch(`https://us-central1-${projectId}.cloudfunctions.net/adminLiveInput`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, input })
  })
  if (!response.ok) throw new Error(`Admin live input failed (${response.status}): ${await response.text()}`)
}
