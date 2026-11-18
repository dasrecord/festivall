<template>
  <main class="short-links">
    <header class="page-header">
      <div>
        <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
        <p class="eyebrow">Dashboard tool</p>
        <h1>Vanity Short Links</h1>
        <p class="intro">Create memorable festivall.ca links and send them wherever you need.</p>
        <p v-if="isLocalDev" class="notice notice--info">
          Local test mode: links are stored on this computer and are not published to festivall.ca.
        </p>
      </div>
    </header>

    <p v-if="message" class="notice" :class="`notice--${messageType}`" role="status">
      {{ message }}
    </p>

    <section v-if="!isAdmin" class="notice notice--error" role="alert">
      Admin access is required to manage short links.
      <RouterLink to="/login">Go to Login</RouterLink>
    </section>

    <template v-else>
      <section class="add-link" aria-labelledby="add-link-heading">
        <h2 id="add-link-heading">Create a short link</h2>
        <form class="link-form" @submit.prevent="createShortLink">
          <label>
            Short path
            <div class="slug-input">
              <span>{{ shortUrlPrefix }}</span>
              <input
                v-model="newSlug"
                type="text"
                maxlength="48"
                pattern="[a-z0-9]+([\-][a-z0-9]+)*"
                placeholder="tickets"
                autocomplete="off"
                required
              />
            </div>
          </label>
          <label>
            Destination URL
            <input
              v-model="newTargetUrl"
              type="url"
              maxlength="2048"
              placeholder="https://example.com/tickets"
              required
            />
          </label>
          <button class="button button--primary" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Creating…' : 'Create link' }}
          </button>
        </form>
      </section>

      <section class="link-list" aria-labelledby="link-list-heading">
        <div class="section-heading">
          <h2 id="link-list-heading">Your short links</h2>
          <button class="button button--secondary" type="button" :disabled="isLoading" @click="loadLinks()">
            {{ isLoading ? 'Loading…' : 'Refresh' }}
          </button>
        </div>
        <p v-if="isLoading" class="empty-state">Loading links…</p>
        <p v-else-if="!loadFailed && !links.length" class="empty-state">No short links yet.</p>
        <article v-for="link in links" :key="link.slug" class="link-card">
          <div class="link-details">
            <a class="short-url" :href="shortUrl(link.slug)" target="_blank" rel="noopener noreferrer">
              {{ shortUrl(link.slug) }}
            </a>
            <template v-if="editingSlug === link.slug">
              <form class="edit-form" @submit.prevent="saveEdit(link.slug)">
                <label :for="`target-${link.slug}`">Destination URL</label>
                <input
                  :id="`target-${link.slug}`"
                  v-model="editTargetUrl"
                  type="url"
                  maxlength="2048"
                  required
                />
                <div class="actions">
                  <button class="button button--primary" type="submit" :disabled="isSaving">
                    {{ isSaving ? 'Saving…' : 'Save destination' }}
                  </button>
                  <button class="button button--secondary" type="button" @click="cancelEdit">Cancel</button>
                </div>
              </form>
            </template>
            <a v-else class="destination" :href="link.targetUrl" target="_blank" rel="noopener noreferrer">
              {{ link.targetUrl }}
            </a>
          </div>
          <div v-if="editingSlug !== link.slug" class="actions">
            <button class="button button--secondary" type="button" @click="copyShortUrl(link.slug)">
              Copy
            </button>
            <button class="button button--secondary" type="button" @click="startEdit(link)">
              Edit
            </button>
            <button
              class="button button--danger"
              type="button"
              :disabled="deletingSlug === link.slug"
              @click="removeShortLink(link.slug)"
            >
              {{ deletingSlug === link.slug ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </article>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { festivall_auth } from '@/firebase'
import { useReunionAdmin } from '@/composables/useReunionAdmin'
import { readShortLinksResponse } from '@/utils/shortLinksApi'

interface ShortLink {
  slug: string
  targetUrl: string
  createdAt?: string | null
}

interface ShortLinksResponse {
  error?: string
  links?: ShortLink[]
}

const { isAdmin } = useReunionAdmin()
const isLocalDev = import.meta.env.DEV
const shortUrlPrefix = `${window.location.host}/s/`
const links = ref<ShortLink[]>([])
const newSlug = ref('')
const newTargetUrl = ref('')
const editingSlug = ref('')
const editTargetUrl = ref('')
const isLoading = ref(false)
const loadFailed = ref(false)
const isSaving = ref(false)
const deletingSlug = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

function shortUrl(slug: string) {
  return `${window.location.origin}/s/${slug}`
}

function setMessage(text: string, type: 'success' | 'error') {
  message.value = text
  messageType.value = type
}

async function requestApi(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: { slug: string; targetUrl?: string }
) {
  const user = festivall_auth.currentUser
  if (!user) throw new Error('Please sign in again to manage short links.')
  const token = await user.getIdToken()
  const response = await fetch('/api/short-links', {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  return await readShortLinksResponse(response) as ShortLinksResponse
}

async function loadLinks(clearMessage = true) {
  isLoading.value = true
  loadFailed.value = false
  if (clearMessage) message.value = ''
  try {
    const result = await requestApi('GET')
    if (!Array.isArray(result.links)) throw new Error('The short-link service returned an invalid link list.')
    links.value = result.links
  } catch (error) {
    console.error('Unable to load short links:', error)
    loadFailed.value = true
    setMessage(error instanceof Error ? error.message : 'Short links could not be loaded.', 'error')
  } finally {
    isLoading.value = false
  }
}

async function createShortLink() {
  const slug = newSlug.value.trim()
  const targetUrl = newTargetUrl.value.trim()
  if (!/^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/.test(slug)) {
    setMessage('Use a lowercase slug with letters, numbers, and interior hyphens.', 'error')
    return
  }
  isSaving.value = true
  message.value = ''
  try {
    await requestApi('POST', { slug, targetUrl })
    newSlug.value = ''
    newTargetUrl.value = ''
    await loadLinks(false)
    if (!message.value) setMessage(`Created ${shortUrl(slug)}`, 'success')
  } catch (error) {
    console.error(`Unable to create short link "${slug}":`, error)
    setMessage(error instanceof Error ? error.message : 'The short link could not be created.', 'error')
  } finally {
    isSaving.value = false
  }
}

function startEdit(link: ShortLink) {
  editingSlug.value = link.slug
  editTargetUrl.value = link.targetUrl
  message.value = ''
}

function cancelEdit() {
  editingSlug.value = ''
  editTargetUrl.value = ''
}

async function saveEdit(slug: string) {
  isSaving.value = true
  message.value = ''
  try {
    await requestApi('PUT', { slug, targetUrl: editTargetUrl.value.trim() })
    cancelEdit()
    await loadLinks(false)
    if (!message.value) setMessage(`Updated ${shortUrl(slug)}`, 'success')
  } catch (error) {
    console.error(`Unable to update short link "${slug}":`, error)
    setMessage(error instanceof Error ? error.message : 'The short link could not be updated.', 'error')
  } finally {
    isSaving.value = false
  }
}

async function removeShortLink(slug: string) {
  if (!window.confirm(`Delete ${shortUrl(slug)}? This cannot be undone.`)) return
  deletingSlug.value = slug
  message.value = ''
  try {
    await requestApi('DELETE', { slug })
    links.value = links.value.filter((link) => link.slug !== slug)
    setMessage(`Deleted ${shortUrl(slug)}`, 'success')
  } catch (error) {
    console.error(`Unable to delete short link "${slug}":`, error)
    setMessage(error instanceof Error ? error.message : 'The short link could not be deleted.', 'error')
  } finally {
    deletingSlug.value = ''
  }
}

async function copyShortUrl(slug: string) {
  try {
    await navigator.clipboard.writeText(shortUrl(slug))
    setMessage(`Copied ${shortUrl(slug)}`, 'success')
  } catch (error) {
    console.error('Unable to copy short link:', error)
    setMessage('Could not access the clipboard. Copy the link directly instead.', 'error')
  }
}

watch(isAdmin, (admin) => {
  if (admin) void loadLinks()
}, { immediate: true })
</script>

<style scoped>
.short-links {
  width: min(100% - 2rem, 920px);
  margin: 0 auto;
  padding: 2rem 0 4rem;
  color: #252525;
}

.page-header {
  margin-bottom: 1.5rem;
}

.back-link {
  color: #426990;
  font-weight: 600;
  text-decoration: none;
}

.eyebrow {
  margin: 1.5rem 0 0.25rem;
  color: #426990;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0.4rem;
}

.intro {
  color: #59636d;
}

.add-link,
.link-list {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid #d6dde4;
  border-radius: 12px;
  background: #fff;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.link-form {
  display: grid;
  grid-template-columns: minmax(180px, 0.8fr) minmax(260px, 1.5fr) auto;
  align-items: end;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  color: #35414b;
  font-size: 0.9rem;
  font-weight: 600;
}

input {
  width: 100%;
  min-width: 0;
  padding: 0.65rem 0.7rem;
  border: 1px solid #b9c3cc;
  border-radius: 6px;
  color: #202a32;
  font: inherit;
}

input:focus {
  border-color: #426990;
  outline: 2px solid #42699033;
}

.slug-input {
  display: flex;
  align-items: center;
  border: 1px solid #b9c3cc;
  border-radius: 6px;
  overflow: hidden;
}

.slug-input span {
  padding-left: 0.65rem;
  color: #59636d;
  white-space: nowrap;
}

.slug-input input {
  border: 0;
  border-radius: 0;
}

.button {
  padding: 0.6rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
}

.button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.button--primary {
  background: #315d84;
  color: #fff;
}

.button--secondary {
  border-color: #bdc7d0;
  background: #fff;
  color: #34495c;
}

.button--danger {
  border-color: #e6bcbc;
  background: #fff7f7;
  color: #9c2929;
}

.notice {
  padding: 0.8rem 1rem;
  border-radius: 8px;
}

.notice--success {
  background: #e7f4eb;
  color: #21633b;
}

.notice--error {
  background: #f9e9e9;
  color: #8d2424;
}

.notice--info {
  background: #e8eff6;
  color: #345b7a;
}

.notice a {
  margin-left: 0.5rem;
  color: inherit;
  font-weight: 700;
}

.section-heading,
.link-card,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-heading h2 {
  margin-bottom: 0;
}

.link-card {
  padding: 1rem 0;
  border-top: 1px solid #e4e8ec;
}

.link-card:first-of-type {
  margin-top: 0.75rem;
}

.link-details {
  display: grid;
  min-width: 0;
  gap: 0.45rem;
}

.short-url {
  color: #315d84;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.destination {
  color: #59636d;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

.edit-form {
  display: grid;
  gap: 0.6rem;
}

.actions {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.empty-state {
  margin: 1rem 0 0;
  color: #657580;
}

@media (max-width: 700px) {
  .short-links {
    width: min(100% - 1.25rem, 920px);
  }

  .link-form {
    grid-template-columns: 1fr;
  }

  .link-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
