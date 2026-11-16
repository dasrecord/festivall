import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { onRequest } from 'firebase-functions/v2/https'
import { REUNION_ADMIN_UIDS } from './admin-uids.js'
import { signAdminLiveInput } from './admin-live-signature.js'
import { createAdminLiveHandler } from './admin-live-handler.js'

const app = initializeApp()
const festivallProject = defineString('FESTIVALL_AUTH_PROJECT_ID', { default: 'festivall-6969' })
const adminSecret = defineSecret('LIVE_BRIDGE_ADMIN_SECRET')

const handleAdminLiveInput = createAdminLiveHandler({
  verifyToken: (token) => getAuth(initializeFestivallAuth()).verifyIdToken(token),
  isAdmin: (uid) => REUNION_ADMIN_UIDS.includes(uid),
  save: async (kind, input, uid) => {
    const ref = getFirestore(app).collection(kind === 'paint' ? 'live_paint' : 'live_inputs').doc()
    const data = { ...input, admin_uid: uid, createdAt: Timestamp.now() }
    data.admin_signature = signAdminLiveInput(adminSecret.value(), kind, ref.id, data)
    await ref.create(data)
  },
  logError: (error) => console.error('Admin live input failed:', error)
})
export const adminLiveInput = onRequest(
  { cors: true, invoker: 'public', secrets: [adminSecret] },
  handleAdminLiveInput
)

let authApp
function initializeFestivallAuth() {
  if (!authApp) authApp = initializeApp({ projectId: festivallProject.value() }, 'festivall-auth')
  return authApp
}
