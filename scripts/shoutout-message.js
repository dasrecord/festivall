export async function makeShoutoutMessage(doc, db, fonts) {
  const d = doc.data()
  let badgeNumber = null
  if (typeof d.id_code === 'string' && d.id_code.trim()) {
    const matches = await db.collection('participant_badges')
      .where('idCodes', 'array-contains', d.id_code.trim()).get()
    const active = matches.docs.filter((match) => match.data().active === true)
    if (active.length > 1) throw new Error(`Ambiguous badge match for shout-out ${doc.id}`)
    if (active.length === 1) {
      const badge = active[0].data().badgeNumber
      if (!Number.isInteger(badge) || badge < 1 || badge > 6) {
        throw new Error(`Invalid badge for shout-out ${doc.id}`)
      }
      badgeNumber = badge
    }
  }
  return {
    type: 'text',
    id: doc.id,
    name: d.name || '',
    text: d.text || '',
    font: fonts.has(d.font) ? d.font : 'Arial',
    color: d.color || '#ffffff',
    fx: d.fx || 'none',
    badgeNumber
  }
}
