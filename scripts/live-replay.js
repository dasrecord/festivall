// Buffer live messages during replay so they follow the historical snapshot.
export function createReplaySession(send, loadBacklog, onError) {
  let loading = false
  let pending = []

  async function replay() {
    if (loading) return
    loading = true
    try {
      const history = await loadBacklog()
      const pendingIds = new Set(pending.map((message) => message.id))
      send({ type: 'reset' })
      history.filter((message) => !pendingIds.has(message.id))
        .forEach((message) => send({ ...message, replay: true }))
    } catch (error) {
      onError(error)
    } finally {
      const queued = pending
      pending = []
      loading = false
      queued.forEach(send)
    }
  }

  function live(message) {
    if (loading) pending.push(message)
    else send(message)
  }

  return { replay, live }
}
