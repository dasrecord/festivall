import { ref, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

export function useReunionPosterData() {
  const signedArtists = ref(/** @type {{ id: string, act_name: string }[]} */ ([]))
  const signedWorkshops = ref(/** @type {{ id: string, workshop_title: string }[]} */ ([]))
  const loading = ref(true)

  onMounted(async () => {
    try {
      const snap = await getDocs(
        query(
          collection(reunion_db, REUNION_FESTIVAL.participantsCollection),
          where('contract.signed', '==', true),
        ),
      )

      snap.docs.forEach((doc) => {
        const data = doc.data()
        const roles = data.roles || {}
        const appData = (data.application && data.application.data) || {}
        const types = roles.applicant_types || data.applicant_types || []

        if (types.includes('Artist')) {
          const name = roles.act_name || data.act_name || ''
          if (name) signedArtists.value.push({ id: doc.id, act_name: name })
        }

        if (types.includes('Workshop')) {
          const title = appData.workshop_title || data.workshop_title || roles.workshop_title || ''
          if (title) signedWorkshops.value.push({ id: doc.id, workshop_title: title })
        }
      })
    } catch (err) {
      console.error('[useReunionPosterData]', err)
    } finally {
      loading.value = false
    }
  })

  return { signedArtists, signedWorkshops, loading }
}
