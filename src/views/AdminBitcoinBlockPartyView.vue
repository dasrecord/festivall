<template>
  <div class="bbp-admin">
    <!-- Unauthenticated State -->
    <div v-if="!isAuthenticated" class="auth-required">
      <h2>🔒 Authentication Required</h2>
      <p>Please log in to access the Bitcoin Block Party admin dashboard.</p>
      <RouterLink to="/login" class="login-button">Go to Login</RouterLink>
    </div>

    <!-- Unauthorized State (logged in but not BBP admin) -->
    <div v-else-if="!isAdmin" class="access-denied">
      <h2>⛔ Access Denied</h2>
      <p>You do not have permission to access the Bitcoin Block Party admin dashboard.</p>
      <RouterLink to="/dashboard" class="back-button">Go to Dashboard</RouterLink>
    </div>

    <!-- Admin Interface -->
    <div v-else class="admin-interface">
      <!-- Edit Contact Modal -->
      <div v-if="editingApplicant" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>✏️ Edit Contact Info</h2>
            <button @click="closeEditModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-subtitle">{{ editingApplicant.contact_name }} ({{ editingApplicant.role }})</p>
            <div class="edit-field">
              <label>Email *</label>
              <input 
                type="email" 
                v-model="editForm.email" 
                placeholder="email@example.com"
                class="edit-input"
              />
            </div>
            <div class="edit-field">
              <label>Phone *</label>
              <input 
                type="tel" 
                v-model="editForm.phone" 
                placeholder="+1 (555) 555-5555"
                class="edit-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn-cancel">Cancel</button>
            <button @click="saveContactInfo" class="btn-save" :disabled="!editForm.email.trim() || !editForm.phone.trim()">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Sponsor/Vendor Content Modal -->
      <div v-if="editingContent" class="modal-overlay" @click.self="closeContentModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>✏️ Edit {{ editingContent.role === 'sponsor' ? 'Sponsor' : editingContent.role === 'food_truck' ? 'Food Truck' : 'Vendor' }} Display Content</h2>
            <button @click="closeContentModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p class="modal-subtitle">{{ editingContent.contact_name }}</p>
            <div class="edit-field">
              <label>Display Name *</label>
              <input 
                type="text" 
                v-model="contentForm.displayName" 
                placeholder="Organization name as shown on website"
                class="edit-input"
              />
            </div>
            <div class="edit-field">
              <label>Short Description *</label>
              <textarea 
                v-model="contentForm.shortDescription" 
                placeholder="Brief description shown on landing page and map"
                class="edit-input edit-textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="edit-field">
              <label>Website URL</label>
              <input 
                type="url" 
                v-model="contentForm.url" 
                placeholder="https://example.com"
                class="edit-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeContentModal" class="btn-cancel">Cancel</button>
            <button @click="saveContentInfo" class="btn-save" :disabled="!contentForm.displayName.trim() || !contentForm.shortDescription.trim()">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Applicant Modal -->
      <div v-if="addingNew" class="modal-overlay" @click.self="closeAddNewModal">
        <div class="modal-content modal-content--wide">
          <div class="modal-header">
            <h2>➕ Add New {{ addingNew === 'sponsor' ? 'Sponsor' : addingNew === 'food_truck' ? 'Food Truck' : 'Vendor' }}</h2>
            <button @click="closeAddNewModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-section">
              <h3>Contact Information</h3>
              <div class="edit-field">
                <label>Contact Name *</label>
                <input 
                  type="text" 
                  v-model="newApplicantForm.contact_name" 
                  placeholder="Full name"
                  class="edit-input"
                />
              </div>
              <div class="edit-field">
                <label>Email *</label>
                <input 
                  type="email" 
                  v-model="newApplicantForm.email" 
                  placeholder="email@example.com"
                  class="edit-input"
                />
              </div>
              <div class="edit-field">
                <label>Phone</label>
                <input 
                  type="tel" 
                  v-model="newApplicantForm.phone" 
                  placeholder="+1 (555) 555-5555"
                  class="edit-input"
                />
              </div>
            </div>
            <div class="form-section">
              <h3>Display Information</h3>
              <div class="edit-field">
                <label>Display Name *</label>
                <input 
                  type="text" 
                  v-model="newApplicantForm.displayName" 
                  placeholder="Organization name as shown on website"
                  class="edit-input"
                />
              </div>
              <div class="edit-field">
                <label>Short Description *</label>
                <textarea 
                  v-model="newApplicantForm.shortDescription" 
                  placeholder="Brief description shown on landing page and map"
                  class="edit-input edit-textarea"
                  rows="3"
                ></textarea>
              </div>
              <div class="edit-field">
                <label>Website URL</label>
                <input 
                  type="url" 
                  v-model="newApplicantForm.url" 
                  placeholder="https://example.com"
                  class="edit-input"
                />
              </div>
              <div class="edit-field" v-if="addingNew === 'sponsor' || addingNew === 'vendor'">
                <label>Tier *</label>
                <select v-model="newApplicantForm.tier" class="edit-input">
                  <option value="">Select tier...</option>
                  <template v-if="addingNew === 'sponsor'">
                    <option value="satoshi">SATOSHI (Presenting)</option>
                    <option value="whale">WHALE (Premium)</option>
                    <option value="bull">BULL (Supporting)</option>
                  </template>
                  <template v-if="addingNew === 'vendor'">
                    <option value="hodler">HODLER</option>
                    <option value="diamond_hands">DIAMOND HANDS</option>
                  </template>
                </select>
              </div>
              <div class="edit-field">
                <label>Map Icon # <span class="optional">(0-99, leave blank if not on map)</span></label>
                <input 
                  type="number" 
                  v-model.number="newApplicantForm.ordinal" 
                  min="0"
                  max="99"
                  :placeholder="addingNew === 'food_truck' ? '0-9' : addingNew === 'sponsor' ? '0-4' : '0-6'"
                  class="edit-input"
                />
              </div>
              <div class="edit-field">
                <label>Display Order <span class="optional">(lower numbers appear first)</span></label>
                <input 
                  type="number" 
                  v-model.number="newApplicantForm.displayOrder" 
                  min="0"
                  max="999"
                  placeholder="0-999"
                  class="edit-input"
                />
              </div>
              <div class="edit-field">
                <label>Status</label>
                <select v-model="newApplicantForm.status" class="edit-input">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeAddNewModal" class="btn-cancel">Cancel</button>
            <button 
              @click="saveNewApplicant" 
              class="btn-save" 
              :disabled="!isNewApplicantFormValid || savingNewApplicant"
            >
              {{ savingNewApplicant ? 'Saving...' : 'Add ' + (addingNew === 'sponsor' ? 'Sponsor' : addingNew === 'food_truck' ? 'Food Truck' : 'Vendor') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="header">
        <RouterLink to="/bitcoinblockparty" class="back-link">← Bitcoin Block Party</RouterLink>
        <h1>₿ Bitcoin Block Party Admin</h1>
        <p>Manage sponsors, vendors, and volunteers for {{ BBP.year }}</p>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-label">Sponsors</div>
          <div class="stat-value">{{ stats.sponsors.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.sponsors.confirmed }} confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Vendors</div>
          <div class="stat-value">{{ stats.vendors.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.vendors.confirmed }} confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Food Trucks</div>
          <div class="stat-value">{{ stats.food_trucks.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.food_trucks.confirmed }} confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Volunteers</div>
          <div class="stat-value">{{ stats.volunteers.pending }} pending</div>
          <div class="stat-subvalue">{{ stats.volunteers.confirmed }} confirmed</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Attendees</div>
          <div class="stat-value">{{ stats.attendees.total }} RSVPs</div>
          <div class="stat-subvalue">Captured on the website</div>
        </div>
      </div>

      <!-- Role Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in roleTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: selectedRole === tab.value }"
          @click="selectedRole = tab.value"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Status Filter & Search -->
      <div v-if="selectedRole !== 'schedule' && selectedRole !== 'features' && selectedRole !== 'attendees' && selectedRole !== 'flyer'" class="controls">
        <div class="controls-left">
          <div class="status-filters">
            <label v-if="selectedRole !== 'attendees'" class="status-filter">
              <input type="radio" v-model="selectedStatus" value="all" />
              All
            </label>
            <label v-if="selectedRole !== 'attendees'" class="status-filter">
              <input type="radio" v-model="selectedStatus" value="pending" />
              Pending
            </label>
            <label v-if="selectedRole !== 'attendees'" class="status-filter">
              <input type="radio" v-model="selectedStatus" value="confirmed" />
              Confirmed
            </label>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by name, email, or organization..."
            class="search-input"
          />
        </div>
        <button 
          v-if="selectedRole === 'sponsor' || selectedRole === 'vendor' || selectedRole === 'food_trucks'"
          @click="openAddNew()"
          class="btn-add-new"
        >
          ➕ Add New {{ selectedRole === 'sponsor' ? 'Sponsor' : selectedRole === 'food_trucks' ? 'Food Truck' : 'Vendor' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && selectedRole !== 'schedule' && selectedRole !== 'features' && selectedRole !== 'attendees' && selectedRole !== 'flyer'" class="loading">
        <div class="spinner"></div>
        Loading applicants...
      </div>

      <!-- Applicant Table -->
      <div v-else-if="filteredApplicants.length > 0 && selectedRole !== 'schedule' && selectedRole !== 'features' && selectedRole !== 'attendees' && selectedRole !== 'flyer'" class="applicants-table">
        <div class="table-header">
          <div class="col-name">Name</div>
          <div class="col-contact">Contact</div>
          <div class="col-org">Organization / Tier</div>
          <div v-if="selectedRole === 'sponsor' || selectedRole === 'vendor' || selectedRole === 'food_trucks' || selectedRole === 'all'" class="col-ordinal">Map Icon #</div>
          <div v-if="selectedRole === 'sponsor' || selectedRole === 'vendor' || selectedRole === 'food_trucks' || selectedRole === 'all'" class="col-order">Display Order</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>
        <div
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          class="applicant-row"
          :class="{ confirmed: applicant.status === 'confirmed' }"
        >
          <div class="col-name">
            <strong>{{ applicant.contact_name }}</strong>
            <div class="role-badge" :class="applicant.role">{{ applicant.role }}</div>
          </div>
          <div class="col-contact">
            <div v-if="applicant.email" class="contact-item">
              📧 {{ applicant.email }}
            </div>
            <div v-if="applicant.phone" class="contact-item">
              📱 {{ applicant.phone }}
            </div>
            <div v-if="!applicant.email" class="contact-warning">
              ⚠️ Missing email
            </div>
          </div>
          <div class="col-org">
            <div v-if="applicant.displayName || applicant.org_name">
              {{ applicant.displayName || applicant.org_name }}
            </div>
            <div v-if="applicant.tier" class="tier-badge">{{ applicant.tier }}</div>
            <div v-if="applicant.url" class="org-url">
              <a :href="applicant.url" target="_blank" rel="noopener noreferrer">🔗 Website</a>
            </div>
          </div>
          <div v-if="applicant.role === 'sponsor' || applicant.role === 'vendor' || applicant.role === 'food_truck'" class="col-ordinal">
            <input 
              type="number" 
              :value="applicant.ordinal ?? ''" 
              @change="updateOrdinal(applicant, $event.target.value)"
              min="0"
              max="99"
              class="ordinal-input"
              :disabled="applicant.status !== 'confirmed'"
              :placeholder="applicant.role === 'food_truck' ? '0-9' : applicant.tier === 'whale' ? '0-2' : applicant.tier === 'bull' ? '0-4' : '0-6'"
            />
          </div>
          <div v-if="applicant.role === 'sponsor' || applicant.role === 'vendor' || applicant.role === 'food_truck'" class="col-order">
            <div class="order-controls">
              <input 
                type="number" 
                :value="applicant.displayOrder ?? 999" 
                @change="updateDisplayOrder(applicant, $event.target.value)"
                min="0"
                max="999"
                class="order-input"
                :disabled="applicant.status !== 'confirmed'"
              />
              <div class="order-buttons">
                <button 
                  @click="moveUp(applicant)" 
                  :disabled="applicant.status !== 'confirmed'"
                  class="btn-order-move"
                  title="Move up"
                >▲</button>
                <button 
                  @click="moveDown(applicant)" 
                  :disabled="applicant.status !== 'confirmed'"
                  class="btn-order-move"
                  title="Move down"
                >▼</button>
              </div>
            </div>
            <div v-if="orderSaving[applicant.id]" class="order-saving">Saving...</div>
          </div>
          <div class="col-status">
            <span class="status-badge" :class="applicant.status">
              {{ applicant.status }}
            </span>
            <div v-if="applicant.onboarding?.sent_at" class="onboarding-info">
              Sent {{ formatDate(applicant.onboarding.sent_at) }}
              <br />by {{ applicant.onboarding.sent_by_email }}
            </div>
          </div>
          <div class="col-actions">
            <div v-if="applicant.role === 'sponsor' || applicant.role === 'vendor' || applicant.role === 'food_truck'" class="content-edit-wrapper">
              <button @click="editContent(applicant)" class="btn-edit-content" title="Edit display content">
                ✏️ Edit Content
              </button>
            </div>
            <div v-if="!canOnboard(applicant) && applicant.status === 'pending'" class="missing-contact-warning">
              ⚠️ Cannot onboard: missing {{ getMissingFields(applicant) }}
              <button @click="editContact(applicant)" class="btn-edit-contact">✏️ Edit Contact</button>
            </div>
            <button
              v-else-if="applicant.status === 'pending'"
              @click="onboardApplicant(applicant)"
              :disabled="onboardingStates[applicant.id]?.sending"
              class="btn-onboard"
            >
              {{ onboardingStates[applicant.id]?.sending ? 'Sending...' : '✉️ Onboard' }}
            </button>
            <button
              v-else-if="applicant.status === 'confirmed' && applicant.onboarding?.sent_at"
              @click="confirmResend(applicant)"
              :disabled="onboardingStates[applicant.id]?.sending"
              class="btn-resend"
            >
              {{ onboardingStates[applicant.id]?.sending ? 'Sending...' : '🔄 Resend' }}
            </button>
            <div v-if="onboardingStates[applicant.id]?.error" class="error-message">
              {{ onboardingStates[applicant.id].error }}
            </div>
            <div v-if="onboardingStates[applicant.id]?.success" class="success-message">
              ✅ {{ onboardingStates[applicant.id].success }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="selectedRole !== 'schedule' && selectedRole !== 'features' && selectedRole !== 'attendees' && selectedRole !== 'flyer'" class="empty-state">
        <p>No {{ selectedStatus === 'all' ? '' : selectedStatus }} {{ selectedRole }} applicants found.</p>
      </div>

      <!-- Attendees Table -->
      <div v-if="selectedRole === 'attendees'" class="schedule-editor">
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>Attendees</h2>
            <span class="bbp-attendee-count">{{ filteredAttendees.length }} records</span>
          </div>
          <div v-if="loadingAttendees" class="loading"><div class="spinner"></div> Loading RSVPs…</div>
          <div v-else-if="filteredAttendees.length === 0" class="sched-empty">No RSVPs captured yet.</div>
          <div v-else class="applicants-table bbp-attendees-table">
            <div class="table-header bbp-attendees-header">
              <div class="col-name">Name</div>
              <div class="col-contact">Email</div>
              <div class="col-org">Registered</div>
              <div class="col-status">Source</div>
            </div>
            <div v-for="attendee in filteredAttendees" :key="attendee.id" class="applicant-row bbp-attendee-row">
              <div class="col-name"><strong>{{ attendee.name }}</strong></div>
              <div class="col-contact">{{ attendee.email }}</div>
              <div class="col-org">{{ formatDate(attendee.createdAt) }}</div>
              <div class="col-status">
                <span class="status-badge confirmed">RSVP</span>
                <div class="attendee-source">{{ attendee.source || 'website' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Schedule Editor ───────────────────────────────────────────── -->
      <div v-if="selectedRole === 'schedule'" class="schedule-editor">

        <!-- Schedule item edit modal -->
        <div v-if="scheduleModal.open" class="modal-overlay" @click.self="closeScheduleModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ scheduleModal.isNew ? 'Add' : 'Edit' }} {{ scheduleModal.sectionLabel }}</h2>
              <button @click="closeScheduleModal" class="modal-close">✕</button>
            </div>
            <div class="modal-body">

              <!-- Itinerary fields -->
              <template v-if="scheduleModal.field === 'itinerary'">
                <div class="edit-field">
                  <label>Time *</label>
                  <input type="text" v-model="scheduleForm.time" placeholder="e.g. 2:00 PM" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Label *</label>
                  <input type="text" v-model="scheduleForm.label" placeholder="e.g. Lightning Talks" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Note <span class="optional">(optional)</span></label>
                  <input type="text" v-model="scheduleForm.note" placeholder="e.g. &ldquo;My Trust In You Is Broken&rdquo;" class="edit-input" />
                </div>
              </template>

              <!-- Screening fields -->
              <template v-if="scheduleModal.field === 'screenings'">
                <div class="edit-field">
                  <label>Time *</label>
                  <input type="text" v-model="scheduleForm.time" placeholder="e.g. 3:00 - 4:00 PM" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Title *</label>
                  <input type="text" v-model="scheduleForm.title" placeholder="Film title" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Description</label>
                  <textarea v-model="scheduleForm.description" rows="4" class="edit-input edit-textarea" placeholder="Short film description"></textarea>
                </div>
                <div class="edit-field">
                  <label>Director</label>
                  <input type="text" v-model="scheduleForm.director" placeholder="Director name" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Director URL</label>
                  <input type="url" v-model="scheduleForm.directorUrl" placeholder="https://twitter.com/..." class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Info / Trailer URL</label>
                  <input type="url" v-model="scheduleForm.infoUrl" placeholder="https://youtu.be/..." class="edit-input" />
                </div>
              </template>

              <!-- DJ fields -->
              <template v-if="scheduleModal.field === 'djs'">
                <div class="edit-field">
                  <label>Name *</label>
                  <input type="text" v-model="scheduleForm.name" placeholder="DJ name or alias" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Description</label>
                  <input type="text" v-model="scheduleForm.shortDescription" placeholder="e.g. Live DJ set from 6:00 PM to 8:00 PM." class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>URL</label>
                  <input type="url" v-model="scheduleForm.url" placeholder="https://instagram.com/..." class="edit-input" />
                </div>
              </template>

              <!-- Speaker fields -->
              <template v-if="scheduleModal.field === 'speakers'">
                <div class="edit-field">
                  <label>Name *</label>
                  <input type="text" v-model="scheduleForm.name" placeholder="Speaker name" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Time *</label>
                  <input type="text" v-model="scheduleForm.time" placeholder="e.g. 2:30 PM" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Talk Topic *</label>
                  <input type="text" v-model="scheduleForm.topic" placeholder="Talk title or topic" class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Company / Affiliation</label>
                  <input type="text" v-model="scheduleForm.company" placeholder="e.g. Zeus, Bitcoin Well, etc." class="edit-input" />
                </div>
                <div class="edit-field">
                  <label>Bio / Description</label>
                  <textarea v-model="scheduleForm.bio" rows="3" class="edit-input edit-textarea" placeholder="Short bio or description"></textarea>
                </div>
                <div class="edit-field">
                  <label>Website / Social URL</label>
                  <input type="url" v-model="scheduleForm.url" placeholder="https://twitter.com/..." class="edit-input" />
                </div>
              </template>

              <!-- Feature fields -->
              <template v-if="scheduleModal.field === 'features'">
                <div class="edit-field">
                  <label>Feature Text *</label>
                  <input type="text" v-model="scheduleForm.text" placeholder="e.g. Live Music" class="edit-input" />
                </div>
              </template>

            </div>
            <div class="modal-footer">
              <button @click="closeScheduleModal" class="btn-cancel">Cancel</button>
              <button
                @click="saveScheduleItem"
                class="btn-save"
                :disabled="scheduleModal.saving || !scheduleFormValid"
              >
                {{ scheduleModal.saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Day Itinerary -->
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>Day Itinerary</h2>
            <button class="btn-add" @click="openScheduleAdd('itinerary')">+ Add Item</button>
          </div>
          <div v-if="schedLoading" class="loading"><div class="spinner"></div> Loading…</div>
          <div v-else-if="schedItinerary.length === 0" class="sched-empty">No itinerary items. Add one above.</div>
          <div v-else class="sched-list">
            <div v-for="(item, idx) in schedItinerary" :key="idx" class="sched-row">
              <span class="sched-time">{{ item.time }}</span>
              <span class="sched-label">{{ item.label }}<span v-if="item.note" class="sched-note"> — {{ item.note }}</span></span>
              <div class="sched-actions">
                <button class="btn-sched-edit" @click="openScheduleEdit('itinerary', idx)">Edit</button>
                <button class="btn-sched-delete" @click="deleteScheduleItem('itinerary', idx)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Film Screenings -->
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>Film Screenings</h2>
            <button class="btn-add" @click="openScheduleAdd('screenings')">+ Add Screening</button>
          </div>
          <div v-if="schedLoading" class="loading"><div class="spinner"></div> Loading…</div>
          <div v-else-if="schedScreenings.length === 0" class="sched-empty">No screenings added yet.</div>
          <div v-else class="sched-list">
            <div v-for="(film, idx) in schedScreenings" :key="idx" class="sched-row sched-row--film">
              <div class="sched-film-meta">
                <span class="sched-time">{{ film.time }}</span>
                <strong class="sched-film-title">{{ film.title }}</strong>
                <span v-if="film.director" class="sched-film-dir">dir. {{ film.director }}</span>
              </div>
              <p class="sched-film-desc">{{ film.description }}</p>
              <div class="sched-actions">
                <button class="btn-sched-edit" @click="openScheduleEdit('screenings', idx)">Edit</button>
                <button class="btn-sched-delete" @click="deleteScheduleItem('screenings', idx)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- DJs -->
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>DJs &amp; Performers</h2>
            <button class="btn-add" @click="openScheduleAdd('djs')">+ Add DJ</button>
          </div>
          <div v-if="schedLoading" class="loading"><div class="spinner"></div> Loading…</div>
          <div v-else-if="schedDjs.length === 0" class="sched-empty">No DJs added yet.</div>
          <div v-else class="sched-list">
            <div v-for="(dj, idx) in schedDjs" :key="idx" class="sched-row">
              <span class="sched-label"><strong>{{ dj.name }}</strong> — {{ dj.shortDescription }}</span>
              <a v-if="dj.url" :href="dj.url" target="_blank" rel="noopener noreferrer" class="sched-dj-url">{{ dj.url }}</a>
              <div class="sched-actions">
                <button class="btn-sched-edit" @click="openScheduleEdit('djs', idx)">Edit</button>
                <button class="btn-sched-delete" @click="deleteScheduleItem('djs', idx)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Speakers -->
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>Speakers</h2>
            <button class="btn-add" @click="openScheduleAdd('speakers')">+ Add Speaker</button>
          </div>
          <div v-if="schedLoading" class="loading"><div class="spinner"></div> Loading…</div>
          <div v-else-if="schedSpeakers.length === 0" class="sched-empty">No speakers added yet.</div>
          <div v-else class="sched-list">
            <div v-for="(speaker, idx) in schedSpeakers" :key="idx" class="sched-row sched-row--speaker">
              <div class="sched-speaker-meta">
                <span class="sched-time">{{ speaker.time }}</span>
                <strong class="sched-speaker-name">{{ speaker.name }}</strong>
                <span v-if="speaker.company" class="sched-speaker-company">{{ speaker.company }}</span>
              </div>
              <p class="sched-speaker-topic"><strong>Topic:</strong> {{ speaker.topic }}</p>
              <p v-if="speaker.bio" class="sched-speaker-bio">{{ speaker.bio }}</p>
              <div class="sched-actions">
                <button class="btn-sched-edit" @click="openScheduleEdit('speakers', idx)">Edit</button>
                <button class="btn-sched-delete" @click="deleteScheduleItem('speakers', idx)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="schedSaveError" class="error-message" style="margin-top:1rem">{{ schedSaveError }}</p>
      </div>

      <!-- ── Features Editor ──────────────────────────────────────────── -->
      <div v-if="selectedRole === 'features'" class="schedule-editor">
        <div class="sched-header-info">
          <h2>✨ Landing Page Features</h2>
          <p>Manage the feature highlights shown on the Bitcoin Block Party landing page. Drag to reorder.</p>
        </div>

        <!-- Feature item edit modal -->
        <div v-if="scheduleModal.open" class="modal-overlay" @click.self="closeScheduleModal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>{{ scheduleModal.isNew ? 'Add' : 'Edit' }} {{ scheduleModal.sectionLabel }}</h2>
              <button @click="closeScheduleModal" class="modal-close">✕</button>
            </div>
            <div class="modal-body">
              <div class="edit-field">
                <label>Feature Text *</label>
                <input type="text" v-model="scheduleForm.text" placeholder="e.g. Live Music" class="edit-input" />
              </div>
            </div>
            <div class="modal-footer">
              <button @click="closeScheduleModal" class="btn-cancel">Cancel</button>
              <button
                @click="saveScheduleItem"
                class="btn-save"
                :disabled="scheduleModal.saving || !scheduleFormValid"
              >
                {{ scheduleModal.saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Features List -->
        <div class="sched-section">
          <div class="sched-section-header">
            <h2>Event Features</h2>
            <button class="btn-add" @click="openScheduleAdd('features')">+ Add Feature</button>
          </div>
          <div v-if="schedLoading" class="loading"><div class="spinner"></div> Loading…</div>
          <div v-else-if="schedFeatures.length === 0" class="sched-empty">No features added yet. Add one above.</div>
          <div v-else class="sched-list">
            <div v-for="(feature, idx) in schedFeatures" :key="idx" class="sched-row sched-row--feature">
              <span class="sched-label"><strong>{{ feature }}</strong></span>
              <div class="sched-actions sched-actions--feature">
                <button 
                  class="btn-sched-move" 
                  @click="moveFeatureUp(idx)" 
                  :disabled="idx === 0"
                  title="Move up"
                >▲</button>
                <button 
                  class="btn-sched-move" 
                  @click="moveFeatureDown(idx)" 
                  :disabled="idx === schedFeatures.length - 1"
                  title="Move down"
                >▼</button>
                <button class="btn-sched-edit" @click="openScheduleEdit('features', idx)">Edit</button>
                <button class="btn-sched-delete" @click="deleteScheduleItem('features', idx)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="schedSaveError" class="error-message" style="margin-top:1rem">{{ schedSaveError }}</p>
      </div>

      <!-- ── Flyer Generator ───────────────────────────────────────────── -->
      <div v-if="selectedRole === 'flyer'" class="flyer-generator">
        <div class="flyer-header">
          <h2>🖨️ Print-Ready Flyers (Live Data)</h2>
          <p>All flyers use live data from Firebase. Changes to schedule and event info appear automatically.</p>
        </div>

        <div class="flyer-controls">
          <label for="flyer-preset-select">Flyer Type:</label>
          <select id="flyer-preset-select" v-model="selectedFlyerPreset" class="flyer-preset-select">
            <optgroup label="Main Flyers">
              <option value="poster">Poster (11×17)</option>
              <option value="handout">Handout (5.5×8.5)</option>
              <option value="schedule">Schedule Poster (8.5×11)</option>
            </optgroup>
            <optgroup label="Signage">
              <option value="wayfinding">Wayfinding Sign (11×8.5 landscape)</option>
              <option value="wayfinding-simple">Simple Direction Arrow (8.5×11)</option>
              <option value="no-alcohol">No Alcohol Zone (11×8.5 landscape)</option>
            </optgroup>
            <optgroup label="Custom">
              <option value="custom">Custom Poster (11×17)</option>
            </optgroup>
          </select>
          <button @click="printFlyer" class="btn-print">🖨 Print</button>
        </div>

        <!-- Poster Preview -->
        <div v-if="selectedFlyerPreset === 'poster'" class="flyer-preview flyer-preview--poster">
          <div class="flyer-page page--poster">
            <img
              class="poster-bg"
              src="/bitcoin_block_party_2026_bg.svg"
              alt=""
              aria-hidden="true"
            />
            <div class="poster-overlay">
              <p class="poster-eyebrow">{{ BBP.city }} · Free Admission</p>
              <p class="poster-date-block">{{ BBP.date }}</p>
              <p class="poster-venue-block">{{ BBP.venue }} · {{ BBP.startTime }} – {{ BBP.endTime }}</p>
              <div class="poster-divider"></div>
              <p class="poster-schedule-title">Day Schedule</p>
              <div class="poster-schedule">
                <div v-for="(item, idx) in schedItinerary" :key="idx" class="poster-schedule-row">
                  <span class="poster-schedule-time">{{ item.time }}</span>
                  <span class="poster-schedule-label">{{ item.label }}<span v-if="item.note"> — {{ item.note }}</span></span>
                </div>
              </div>
              <div class="poster-cta-row">
                <span class="poster-cta-url">festivall.ca/bitcoinblockparty</span>
                <span class="poster-cta-contact">{{ BBP.contactEmail }}</span>
              </div>
              <div class="poster-sponsor-row">
                Presenting Sponsor: Zeus · Powered by Festivall
              </div>
            </div>
          </div>
        </div>

        <!-- Handout Preview -->
        <div v-else-if="selectedFlyerPreset === 'handout'" class="flyer-preview flyer-preview--handout">
          <div class="flyer-page page--handout">
            <div class="handout-header">
              <p class="handout-eyebrow">{{ BBP.city }} · Free Admission</p>
              <h1 class="handout-title">Bitcoin<br>Block Party</h1>
              <p class="handout-date">{{ BBP.date }}</p>
              <p class="handout-venue">{{ BBP.venue }} · {{ BBP.startTime }} – {{ BBP.endTime }}</p>
            </div>
            <div class="handout-divider"></div>
            <p class="handout-section-title">Schedule</p>
            <div v-for="(item, idx) in schedItinerary" :key="idx" class="handout-schedule-row">
              <span class="handout-sched-time">{{ item.time }}</span>
              <span class="handout-sched-label">{{ item.label }}<span v-if="item.note"> — {{ item.note }}</span></span>
            </div>
            <div class="handout-divider"></div>
            <p class="handout-body">
              Free outdoor celebration of Bitcoin, community, and music in the heart of Vancouver.
              Food trucks, speakers, film screenings, live DJs, and Bitcoin prizes.
              All vendors accept Bitcoin. All ages welcome.
            </p>
            <p class="handout-cta">festivall.ca/bitcoinblockparty</p>
            <p class="handout-wallet-note">New to Bitcoin? Get a free wallet: festivall.ca/bitcoin-wallet</p>
            <p class="handout-footer">Presenting Sponsor: Zeus · {{ BBP.contactEmail }} · Powered by Festivall</p>
          </div>
        </div>

        <!-- Schedule Poster Preview -->
        <div v-else-if="selectedFlyerPreset === 'schedule'" class="flyer-preview flyer-preview--schedule">
          <div class="flyer-page page--schedule">
            <div class="schedule-header">
              <div class="schedule-header-left">
                <h1>Day Schedule</h1>
                <p>Bitcoin Block Party {{ BBP.year }} — {{ BBP.venue }}</p>
              </div>
              <div class="schedule-header-right">
                {{ BBP.date }}<br>
                {{ BBP.startTime }} – {{ BBP.endTime }}<br>
                Free Admission
              </div>
            </div>
            <div class="schedule-table">
              <div class="schedule-table-header">
                <span>Time</span>
                <span>Event</span>
              </div>
              <div v-for="(item, idx) in schedItinerary" :key="idx" class="schedule-entry">
                <span class="sched-time">{{ item.time }}</span>
                <span class="sched-label">{{ item.label }}<span v-if="item.note" class="sched-note"> — {{ item.note }}</span></span>
              </div>
            </div>
            <div class="schedule-footer">
              <span class="schedule-footer-url">festivall.ca/bitcoinblockparty</span>
              <span class="schedule-footer-brand">Powered by Festivall</span>
            </div>
          </div>
        </div>

        <!-- Wayfinding Sign (Landscape) -->
        <div v-else-if="selectedFlyerPreset === 'wayfinding'" class="flyer-preview flyer-preview--wayfinding">
          <div class="flyer-page page--wayfinding">
            <div class="wayfinding-content">
              <div class="wayfinding-arrow">→</div>
              <div class="wayfinding-text">
                <h1 class="wayfinding-title">Bitcoin Block Party</h1>
                <p class="wayfinding-venue">{{ BBP.venue }}</p>
                <p class="wayfinding-detail">{{ BBP.date }} · {{ BBP.startTime }}–{{ BBP.endTime }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Simple Direction Arrow -->
        <div v-else-if="selectedFlyerPreset === 'wayfinding-simple'" class="flyer-preview flyer-preview--simple">
          <div class="flyer-page page--simple-arrow">
            <div class="simple-arrow-content">
              <div class="simple-arrow">↓</div>
              <h1 class="simple-arrow-title">Bitcoin Block Party</h1>
              <p class="simple-arrow-detail">This Way</p>
            </div>
          </div>
        </div>

        <!-- No Alcohol Sign -->
        <div v-else-if="selectedFlyerPreset === 'no-alcohol'" class="flyer-preview flyer-preview--no-alcohol">
          <div class="flyer-page page--no-alcohol">
            <div class="no-alcohol-content">
              <div class="no-alcohol-icon">🚫</div>
              <h1 class="no-alcohol-title">No Alcohol</h1>
              <h2 class="no-alcohol-subtitle">Beyond This Point</h2>
              <p class="no-alcohol-detail">Alcohol-free zone ahead</p>
              <p class="no-alcohol-footer">Bitcoin Block Party {{ BBP.year }}</p>
            </div>
          </div>
        </div>

        <!-- Custom Poster -->
        <div v-else-if="selectedFlyerPreset === 'custom'" class="flyer-preview flyer-preview--custom">
          <div class="custom-poster-editor">
            <div class="custom-fields">
              <h3>Custom Poster Editor</h3>
              <div class="edit-field">
                <label>Main Heading</label>
                <input type="text" v-model="customPoster.title" placeholder="Enter main heading" class="edit-input" />
              </div>
              <div class="edit-field">
                <label>Subheading</label>
                <input type="text" v-model="customPoster.subtitle" placeholder="Enter subheading" class="edit-input" />
              </div>
              <div class="edit-field">
                <label>Body Text</label>
                <textarea v-model="customPoster.body" rows="4" class="edit-input" placeholder="Enter body text"></textarea>
              </div>
              <div class="edit-field">
                <label>Footer Text</label>
                <input type="text" v-model="customPoster.footer" placeholder="Optional footer" class="edit-input" />
              </div>
            </div>
          </div>
          <div class="flyer-page page--custom">
            <div class="custom-poster-content">
              <h1 class="custom-title">{{ customPoster.title || 'Your Heading Here' }}</h1>
              <h2 class="custom-subtitle">{{ customPoster.subtitle }}</h2>
              <div class="custom-body" v-html="customPoster.body.replace(/\n/g, '<br>')" v-if="customPoster.body"></div>
              <p class="custom-footer" v-if="customPoster.footer">{{ customPoster.footer }}</p>
              <div class="custom-branding">
                <p>Bitcoin Block Party {{ BBP.year }} · Powered by Festivall</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flyer-help">
          <p><strong>💡 Tip:</strong> Changes made in the Schedule tab will automatically appear here. Click Print to generate print-ready PDFs.</p>
          <p><strong>🖨️ For Print Shops:</strong> When saving as PDF, ensure "Background graphics" is enabled and select the correct paper size:</p>
          <ul class="flyer-help-list">
            <li><strong>Poster / Custom:</strong> 11" × 17" (Tabloid)</li>
            <li><strong>Handout:</strong> 5.5" × 8.5" (Half Letter)</li>
            <li><strong>Schedule / Simple Arrow:</strong> 8.5" × 11" (Letter)</li>
            <li><strong>Wayfinding / No Alcohol:</strong> 11" × 8.5" (Tabloid Landscape)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import { useBitcoinBlockPartyAdmin } from '@/composables/useBitcoinBlockPartyAdmin'
import { useBbpSchedule } from '@/composables/useBbpSchedule'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig'
import { sendBbpEmail } from '/scripts/notifications.js'

// Auth
const isAuthenticated = ref(false)
const { isAdmin, currentUser } = useBitcoinBlockPartyAdmin()

onMounted(() => {
  isAuthenticated.value = !!localStorage.getItem('user')
})

// Role tabs
const roleTabs = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'sponsor', label: 'Sponsors', icon: '₿' },
  { value: 'vendor', label: 'Vendors', icon: '🏪' },
  { value: 'food_trucks', label: 'Food Trucks', icon: '🍔' },
  { value: 'volunteer', label: 'Volunteers', icon: '🙌' },
  { value: 'attendees', label: 'Attendees', icon: '👥' },
  { value: 'schedule', label: 'Schedule', icon: '📅' },
  { value: 'features', label: 'Features', icon: '✨' },
  { value: 'flyer', label: 'Flyer', icon: '🖨️' },
]

// State
const applicants = ref([])
const attendees = ref([])
const loading = ref(false)
const loadingAttendees = ref(false)
const selectedRole = ref('all')
const selectedStatus = ref('all')
const searchQuery = ref('')
const onboardingStates = reactive({})
const orderSaving = reactive({})

// Stats
const stats = computed(() => {
  const result = {
    sponsors: { pending: 0, confirmed: 0 },
    vendors: { pending: 0, confirmed: 0 },
    food_trucks: { pending: 0, confirmed: 0 },
    volunteers: { pending: 0, confirmed: 0 },
    attendees: { total: 0 },
  }
  applicants.value.forEach((app) => {
    let category = app.role === 'volunteer' ? 'volunteers' 
                 : app.role === 'food_truck' ? 'food_trucks'
                 : `${app.role}s`
    if (result[category]) {
      if (app.status === 'pending') result[category].pending++
      else if (app.status === 'confirmed') result[category].confirmed++
    }
  })
  result.attendees.total = attendees.value.length
  return result
})

// Filtered applicants
const filteredApplicants = computed(() => {
  let result = applicants.value

  // Role filter
  if (selectedRole.value !== 'all') {
    if (selectedRole.value === 'food_trucks') {
      result = result.filter((app) => app.role === 'food_truck')
    } else {
      result = result.filter((app) => app.role === selectedRole.value)
    }
  }

  // Status filter
  if (selectedStatus.value !== 'all') {
    result = result.filter((app) => app.status === selectedStatus.value)
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (app) =>
        app.contact_name?.toLowerCase().includes(query) ||
        app.email?.toLowerCase().includes(query) ||
        app.org_name?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => {
    // For sponsors/vendors/food trucks when filtering by role, sort confirmed by displayOrder
    if ((selectedRole.value === 'sponsor' || selectedRole.value === 'vendor' || selectedRole.value === 'food_trucks') && a.status === 'confirmed' && b.status === 'confirmed') {
      const orderA = a.displayOrder ?? 999
      const orderB = b.displayOrder ?? 999
      if (orderA !== orderB) return orderA - orderB
    }
    // Pending first, then by submission date (newest first)
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
  })
})

const filteredAttendees = computed(() => {
  let result = attendees.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (attendee) =>
        attendee.name?.toLowerCase().includes(query) ||
        attendee.email?.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
})

// Load applicants
async function loadApplicants() {
  loading.value = true
  try {
    const allApplicants = []

    // Load sponsors and vendors from bbp_applications_2026
    const appsSnapshot = await getDocs(collection(festivall_db, BBP.collections.applications))
    appsSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.role === 'sponsor' || data.role === 'vendor' || data.role === 'food_truck') {
        allApplicants.push({
          id: docSnap.id,
          role: data.role,
          contact_name: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          org_name: data.org_name || '',
          displayName: data.displayName || data.org_name || '',
          shortDescription: data.shortDescription || '',
          url: data.url || '',
          tier: data.tier || '',
          status: data.status || 'pending',
          submitted_at: data.submitted_at || '',
          onboarding: data.onboarding || null,
          displayOrder: data.displayOrder ?? null,
          ordinal: data.ordinal ?? null,
        })
      }
    })

    // Load volunteers from bbp_volunteers_2026
    const volsSnapshot = await getDocs(collection(festivall_db, BBP.collections.volunteers))
    volsSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      allApplicants.push({
        id: docSnap.id,
        role: data.role || 'volunteer',
        contact_name: data.contact_name || '',
        email: data.email || '',
        phone: data.phone || '',
        org_name: '',
        displayName: '',
        shortDescription: '',
        url: '',
        tier: '',
        status: data.status || 'pending',
        submitted_at: data.submitted_at || '',
        onboarding: data.onboarding || null,
      })
    })

    applicants.value = allApplicants
  } catch (error) {
    console.error('Error loading applicants:', error)
  } finally {
    loading.value = false
  }
}

async function loadAttendees() {
  loadingAttendees.value = true
  try {
    const snapshot = await getDocs(collection(festivall_db, BBP.collections.attendees))
    attendees.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() || {}),
    }))
  } catch (error) {
    console.error('Error loading attendees:', error)
  } finally {
    loadingAttendees.value = false
  }
}

// Watch for admin status and load data when authenticated
watch(isAdmin, (newValue) => {
  if (newValue && applicants.value.length === 0) {
    loadApplicants()
  }
  if (newValue && attendees.value.length === 0) {
    loadAttendees()
  }
}, { immediate: true })

watch(selectedRole, (newValue) => {
  if (newValue === 'schedule') loadSchedule()
  if (newValue === 'attendees' && attendees.value.length === 0) loadAttendees()
})

// Validation
function canOnboard(applicant) {
  return !!applicant.email
}

// Helper to show what's missing
function getMissingFields(applicant) {
  const missing = []
  if (!applicant.email) missing.push('email')
  return missing.join(' and ')
}

// Edit contact modal
const editingApplicant = ref(null)
const editForm = ref({ email: '', phone: '' })

function editContact(applicant) {
  editingApplicant.value = applicant
  editForm.value = {
    email: applicant.email || '',
    phone: applicant.phone || ''
  }
}

function closeEditModal() {
  editingApplicant.value = null
  editForm.value = { email: '', phone: '' }
}

async function saveContactInfo() {
  if (!editingApplicant.value) return
  
  try {
    const collectionName = editingApplicant.value.role === 'volunteer' 
      ? BBP.collections.volunteers 
      : BBP.collections.applications
    
    await updateDoc(doc(festivall_db, collectionName, editingApplicant.value.id), {
      email: editForm.value.email.trim(),
      phone: editForm.value.phone.trim()
    })
    
    // Update local state
    const index = applicants.value.findIndex(a => a.id === editingApplicant.value.id)
    if (index !== -1) {
      applicants.value[index].email = editForm.value.email.trim()
      applicants.value[index].phone = editForm.value.phone.trim()
    }
    
    closeEditModal()
  } catch (error) {
    console.error('Error updating contact info:', error)
    alert('Failed to update contact info. Please try again.')
  }
}

// Edit content modal (for sponsors/vendors)
const editingContent = ref(null)
const contentForm = ref({ displayName: '', shortDescription: '', url: '' })

function editContent(applicant) {
  editingContent.value = applicant
  contentForm.value = {
    displayName: applicant.displayName || applicant.org_name || '',
    shortDescription: applicant.shortDescription || '',
    url: applicant.url || ''
  }
}

function closeContentModal() {
  editingContent.value = null
  contentForm.value = { displayName: '', shortDescription: '', url: '' }
}

async function saveContentInfo() {
  if (!editingContent.value) return
  
  try {
    await updateDoc(doc(festivall_db, BBP.collections.applications, editingContent.value.id), {
      displayName: contentForm.value.displayName.trim(),
      shortDescription: contentForm.value.shortDescription.trim(),
      url: contentForm.value.url.trim()
    })
    
    // Update local state
    const index = applicants.value.findIndex(a => a.id === editingContent.value.id)
    if (index !== -1) {
      applicants.value[index].displayName = contentForm.value.displayName.trim()
      applicants.value[index].shortDescription = contentForm.value.shortDescription.trim()
      applicants.value[index].url = contentForm.value.url.trim()
    }
    
    closeContentModal()
  } catch (error) {
    console.error('Error updating content info:', error)
    alert('Failed to update content info. Please try again.')
  }
}

// Add new applicant modal
const addingNew = ref(null)
const savingNewApplicant = ref(false)
const newApplicantForm = reactive({
  contact_name: '',
  email: '',
  phone: '',
  displayName: '',
  shortDescription: '',
  url: '',
  tier: '',
  ordinal: null,
  displayOrder: null,
  status: 'confirmed'
})

const isNewApplicantFormValid = computed(() => {
  const form = newApplicantForm
  const hasBasicInfo = form.contact_name.trim() && form.email.trim() && form.displayName.trim() && form.shortDescription.trim()
  const hasTier = addingNew.value === 'food_truck' || form.tier
  return hasBasicInfo && hasTier
})

function openAddNew() {
  const role = selectedRole.value === 'food_trucks' ? 'food_truck' : selectedRole.value
  addingNew.value = role
  // Reset form
  Object.assign(newApplicantForm, {
    contact_name: '',
    email: '',
    phone: '',
    displayName: '',
    shortDescription: '',
    url: '',
    tier: '',
    ordinal: null,
    displayOrder: null,
    status: 'confirmed'
  })
}

function closeAddNewModal() {
  addingNew.value = null
}

async function saveNewApplicant() {
  if (!isNewApplicantFormValid.value) return
  
  savingNewApplicant.value = true
  
  try {
    const role = addingNew.value
    const now = new Date().toISOString()
    
    const newApplicantData = {
      role: role,
      contact_name: newApplicantForm.contact_name.trim(),
      email: newApplicantForm.email.trim(),
      phone: newApplicantForm.phone.trim(),
      org_name: newApplicantForm.displayName.trim(),
      displayName: newApplicantForm.displayName.trim(),
      shortDescription: newApplicantForm.shortDescription.trim(),
      url: newApplicantForm.url.trim(),
      tier: newApplicantForm.tier || (role === 'food_truck' ? 'food_truck' : ''),
      status: newApplicantForm.status,
      submitted_at: now,
      created_at: now,
      displayOrder: newApplicantForm.displayOrder ?? null,
      ordinal: newApplicantForm.ordinal ?? null,
      source: 'admin_manual_entry'
    }
    
    const docRef = await addDoc(collection(festivall_db, BBP.collections.applications), newApplicantData)
    
    // Add to local state
    applicants.value.push({
      id: docRef.id,
      ...newApplicantData,
      onboarding: null
    })
    
    closeAddNewModal()
    alert(`${role === 'sponsor' ? 'Sponsor' : role === 'food_truck' ? 'Food truck' : 'Vendor'} added successfully!`)
  } catch (error) {
    console.error('Error adding new applicant:', error)
    alert('Failed to add new applicant. Please try again.')
  } finally {
    savingNewApplicant.value = false
  }
}

// Onboarding templates
function getOnboardingTemplates(applicant) {
  const role = applicant.role
  const name = applicant.contact_name || 'there'
  const eventDate = BBP.date
  const venue = `${BBP.venue}, ${BBP.city}`
  const contactEmail = BBP.contactEmail

  const templates = {
    sponsor: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Sponsor Onboarding`,
      emailBody: `<p>Hi <strong>${name}</strong>,</p>
<p>Thank you for sponsoring Bitcoin Block Party ${BBP.year}!</p>
<p><strong>Event Details:</strong><br>
• Date: ${eventDate}<br>
• Location: ${venue}<br>
• Time: ${BBP.startTime} - ${BBP.endTime}</p>
<p><strong>Next Steps:</strong><br>
1. Review your sponsorship tier benefits<br>
2. Provide your logo and materials (high-res)<br>
3. Confirm your booth/table requirements<br>
4. Let us know if you plan to give away any items</p>
<p>We'll follow up with detailed logistics closer to the event.</p>
<p>Questions? Reply to this email or contact ${contactEmail}.</p>
<p>Best,<br>Bitcoin Block Party Team</p>`,
      smsBody: `Hi ${name}! Thanks for sponsoring Bitcoin Block Party ${BBP.year} on ${eventDate} at ${venue}. Check your email for onboarding details. Questions? ${contactEmail}`,
    },
    vendor: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Vendor Onboarding`,
      emailBody: `<p>Hi <strong>${name}</strong>,</p>
<p>Welcome as a vendor at Bitcoin Block Party ${BBP.year}!</p>
<p><strong>Event Details:</strong><br>
• Date: ${eventDate}<br>
• Location: ${venue}<br>
• Time: ${BBP.startTime} - ${BBP.endTime}</p>
<p><strong>Next Steps:</strong><br>
1. Confirm your Bitcoin payment setup (required)<br>
2. List the items you'll be selling<br>
3. Let us know your power/table requirements<br>
4. Provide any special setup needs</p>
<p>Vendor setup begins 2 hours before doors open.</p>
<p>Questions? Reply to this email or contact ${contactEmail}.</p>
<p>Best,<br>Bitcoin Block Party Team</p>`,
      smsBody: `Hi ${name}! You're confirmed as a vendor for Bitcoin Block Party ${BBP.year} on ${eventDate} at ${venue}. Check your email for setup details. ${contactEmail}`,
    },
    volunteer: {
      emailSubject: `Bitcoin Block Party ${BBP.year} — Volunteer Onboarding`,
      emailBody: `<p>Hi <strong>${name}</strong>,</p>
<p>Thank you for volunteering at Bitcoin Block Party ${BBP.year}!</p>
<p><strong>Event Details:</strong><br>
• Date: ${eventDate}<br>
• Location: ${venue}<br>
• Time: ${BBP.startTime} - ${BBP.endTime}</p>
<p><strong>Next Steps:</strong><br>
1. Confirm your availability and preferred shift<br>
2. Arrival time: 11:30 AM for volunteer briefing<br>
3. Bring comfortable shoes and a positive attitude!</p>
<p><strong>Volunteers receive:</strong><br>
• Free admission<br>
• Volunteer t-shirt<br>
• Meal voucher<br>
• Good vibes and Bitcoin community connections</p>
<p>We'll send shift assignments and final details 1 week before the event.</p>
<p>Questions? Reply to this email or contact ${contactEmail}.</p>
<p>Best,<br>Bitcoin Block Party Team</p>`,
      smsBody: `Hi ${name}! Thanks for volunteering at Bitcoin Block Party ${BBP.year} on ${eventDate}. Check your email for details. Briefing at 11:30 AM. ${contactEmail}`,
    },
  }

  return templates[role] || templates.volunteer
}

// Onboard applicant
async function onboardApplicant(applicant) {
  if (!canOnboard(applicant)) {
    onboardingStates[applicant.id] = {
      error: 'Missing required contact info (email)',
    }
    setTimeout(() => delete onboardingStates[applicant.id], 5000)
    return
  }

  // Check idempotency
  if (applicant.onboarding?.sent_at && applicant.status === 'confirmed') {
    const confirm = window.confirm(
      `This applicant was already onboarded on ${formatDate(applicant.onboarding.sent_at)}. Resend onboarding messages?`
    )
    if (!confirm) return
  }

  onboardingStates[applicant.id] = { sending: true, error: null, success: null }

  try {
    const templates = getOnboardingTemplates(applicant)

    // Send email
    await sendBbpEmail(applicant.email, templates.emailSubject, templates.emailBody)

    // Update Firestore
    const collectionName =
      applicant.role === 'volunteer' ? BBP.collections.volunteers : BBP.collections.applications

    const onboardingMetadata = {
      status: 'confirmed',
      onboarding: {
        sent_at: new Date().toISOString(),
        sent_by_uid: currentUser.value?.uid || '',
        sent_by_email: currentUser.value?.email || '',
        channels: ['email'],
        template_version: '1.0',
        resends: applicant.onboarding?.sent_at
          ? [
              ...(applicant.onboarding.resends || []),
              {
                sent_at: new Date().toISOString(),
                sent_by_uid: currentUser.value?.uid || '',
              },
            ]
          : [],
      },
    }

    await updateDoc(doc(festivall_db, collectionName, applicant.id), onboardingMetadata)

    // Update local state
    const index = applicants.value.findIndex((a) => a.id === applicant.id)
    if (index !== -1) {
      applicants.value[index] = {
        ...applicants.value[index],
        ...onboardingMetadata,
      }
    }

    onboardingStates[applicant.id] = {
      sending: false,
      success: 'Onboarding sent successfully!',
    }

    setTimeout(() => {
      if (onboardingStates[applicant.id]?.success) {
        delete onboardingStates[applicant.id]
      }
    }, 5000)
  } catch (error) {
    console.error('Onboarding error:', error)
    onboardingStates[applicant.id] = {
      sending: false,
      error: error.message || 'Failed to send onboarding messages.',
    }

    setTimeout(() => {
      if (onboardingStates[applicant.id]?.error) {
        delete onboardingStates[applicant.id]
      }
    }, 8000)
  }
}

// Confirm resend
function confirmResend(applicant) {
  onboardApplicant(applicant)
}

// Format date
function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Display Order Management ─────────────────────────────────────────────────
async function updateDisplayOrder(applicant, newOrder) {
  const orderValue = parseInt(newOrder)
  if (isNaN(orderValue)) return

  orderSaving[applicant.id] = true

  try {
    const collection_name = applicant.role === 'volunteer' ? BBP.collections.volunteers : BBP.collections.applications
    await updateDoc(doc(festivall_db, collection_name, applicant.id), {
      displayOrder: orderValue
    })

    // Update local state
    const index = applicants.value.findIndex(a => a.id === applicant.id)
    if (index !== -1) {
      applicants.value[index].displayOrder = orderValue
    }
  } catch (error) {
    console.error('Error updating display order:', error)
    alert('Failed to update display order. Please try again.')
  } finally {
    delete orderSaving[applicant.id]
  }
}

// ── Ordinal Management ─────────────────────────────────────────────────────
async function updateOrdinal(applicant, newOrdinal) {
  const ordinalValue = newOrdinal === '' ? null : parseInt(newOrdinal)
  if (ordinalValue !== null && isNaN(ordinalValue)) return

  orderSaving[applicant.id] = true

  try {
    const collection_name = BBP.collections.applications
    await updateDoc(doc(festivall_db, collection_name, applicant.id), {
      ordinal: ordinalValue
    })

    // Update local state
    const index = applicants.value.findIndex(a => a.id === applicant.id)
    if (index !== -1) {
      applicants.value[index].ordinal = ordinalValue
    }
  } catch (error) {
    console.error('Error updating ordinal:', error)
    alert('Failed to update ordinal. Please try again.')
  } finally {
    delete orderSaving[applicant.id]
  }
}

async function moveUp(applicant) {
  const currentOrder = applicant.displayOrder ?? 999
  const newOrder = Math.max(0, currentOrder - 1)
  
  // Find the item currently at newOrder position and swap
  const blocker = filteredApplicants.value.find(a => 
    a.id !== applicant.id && 
    a.role === applicant.role && 
    a.status === 'confirmed' &&
    (a.displayOrder ?? 999) === newOrder
  )
  
  if (blocker) {
    await updateDisplayOrder(blocker, currentOrder)
  }
  await updateDisplayOrder(applicant, newOrder)
}

async function moveDown(applicant) {
  const currentOrder = applicant.displayOrder ?? 999
  const newOrder = Math.min(999, currentOrder + 1)
  
  // Find the item currently at newOrder position and swap
  const blocker = filteredApplicants.value.find(a => 
    a.id !== applicant.id && 
    a.role === applicant.role && 
    a.status === 'confirmed' &&
    (a.displayOrder ?? 999) === newOrder
  )
  
  if (blocker) {
    await updateDisplayOrder(blocker, currentOrder)
  }
  await updateDisplayOrder(applicant, newOrder)
}

// ── Attendees ───────────────────────────────────────────────────────────────
if (selectedRole.value === 'attendees') {
  loadAttendees()
}

// ── Schedule Editor ──────────────────────────────────────────────────────────
const {
  itinerary: schedItinerary,
  screenings: schedScreenings,
  djs: schedDjs,
  speakers: schedSpeakers,
  features: schedFeatures,
  loading: scheduleLoading,
  saveSchedule,
  loadSchedule,
} = useBbpSchedule()

// Alias for template (schedLoading already used for sections above)
const schedLoading = scheduleLoading

const schedSaveError = ref('')

const SECTION_LABELS = {
  itinerary: 'Itinerary Item',
  screenings: 'Film Screening',
  djs: 'DJ / Performer',
  features: 'Feature',
  speakers: 'Speaker',
}

// Modal state
const scheduleModal = reactive({
  open: false,
  field: '',          // 'itinerary' | 'screenings' | 'djs'
  sectionLabel: '',
  editIndex: -1,      // -1 = new item
  isNew: true,
  saving: false,
})

// Form data — superset of all fields; we only use the relevant subset per section
const scheduleForm = reactive({
  // Itinerary
  time: '',
  label: '',
  note: '',
  // Screenings (+ time above)
  title: '',
  description: '',
  director: '',
  directorUrl: '',
  infoUrl: '',
  // DJs
  name: '',
  shortDescription: '',
  url: '',
  // Speakers (+ name, time, url above)
  topic: '',
  company: '',
  // Features
  text: '',
  bio: '',
})

const scheduleFormValid = computed(() => {
  if (scheduleModal.field === 'itinerary') return !!scheduleForm.time.trim() && !!scheduleForm.label.trim()
  if (scheduleModal.field === 'features') return !!scheduleForm.text.trim()
  if (scheduleModal.field === 'screenings') return !!scheduleForm.time.trim() && !!scheduleForm.title.trim()
  if (scheduleModal.field === 'djs') return !!scheduleForm.name.trim()
  if (scheduleModal.field === 'speakers') return !!scheduleForm.name.trim() && !!scheduleForm.time.trim() && !!scheduleForm.topic.trim()
  return false
})

function resetScheduleForm() {
  scheduleForm.time = ''
  scheduleForm.label = ''
  scheduleForm.note = ''
  scheduleForm.title = ''
  scheduleForm.description = ''
  scheduleForm.director = ''
  scheduleForm.topic = ''
  scheduleForm.company = ''
  scheduleForm.bio = ''
  scheduleForm.directorUrl = ''
  scheduleForm.infoUrl = ''
  scheduleForm.text = ''
  scheduleForm.name = ''
  scheduleForm.shortDescription = ''
  scheduleForm.url = ''
}

function openScheduleAdd(field) {
  resetScheduleForm()
  scheduleModal.field = field
  scheduleModal.sectionLabel = SECTION_LABELS[field] || field
  scheduleModal.editIndex = -1
  scheduleModal.isNew = true
  scheduleModal.saving = false
  scheduleModal.open = true
}

function openScheduleEdit(field, idx) {
  resetScheduleForm()
  const source = field === 'itinerary' ? schedItinerary.value
    : field === 'screenings' ? schedScreenings.value
    : field === 'speakers' ? schedSpeakers.value
    : field === 'features' ? schedFeatures.value
    : schedDjs.value
  const item = source[idx]
  if (!item) return

  // Copy all fields present on the item into the form
  Object.keys(scheduleForm).forEach((key) => {
    if (item[key] !== undefined) scheduleForm[key] = item[key]
  })
  
  // Handle features text field (features are stored as strings)
  if (field === 'features' && typeof item === 'string') {
    scheduleForm.text = item
  }

  scheduleModal.field = field
  scheduleModal.sectionLabel = SECTION_LABELS[field] || field
  scheduleModal.editIndex = idx
  scheduleModal.isNew = false
  scheduleModal.saving = false
  scheduleModal.open = true
}

function closeScheduleModal() {
  scheduleModal.open = false
}

function buildScheduleItem(field) {
  if (field === 'itinerary') {
    const item = { time: scheduleForm.time.trim(), label: scheduleForm.label.trim() }
    if (scheduleForm.note.trim()) item.note = scheduleForm.note.trim()
    return item
  }
  if (field === 'screenings') {
    const item = {
      id: `screening_${Date.now()}`,
      time: scheduleForm.time.trim(),
      title: scheduleForm.title.trim(),
      description: scheduleForm.description.trim(),
    }
    if (scheduleForm.director.trim()) item.director = scheduleForm.director.trim()
    if (scheduleForm.directorUrl.trim()) item.directorUrl = scheduleForm.directorUrl.trim()
    if (scheduleForm.infoUrl.trim()) item.infoUrl = scheduleForm.infoUrl.trim()
    return item
  }
  if (field === 'djs') {
    const item = { name: scheduleForm.name.trim() }
    if (scheduleForm.shortDescription.trim()) item.shortDescription = scheduleForm.shortDescription.trim()
    if (scheduleForm.url.trim()) item.url = scheduleForm.url.trim()
    return item
  }
  if (field === 'speakers') {
    const item = {
      name: scheduleForm.name.trim(),
      time: scheduleForm.time.trim(),
      topic: scheduleForm.topic.trim(),
    }
    if (scheduleForm.company.trim()) item.company = scheduleForm.company.trim()
    if (scheduleForm.bio.trim()) item.bio = scheduleForm.bio.trim()
    if (scheduleForm.url.trim()) item.url = scheduleForm.url.trim()
    return item
  }
  if (field === 'features') {
    return scheduleForm.text.trim()
  }
  return null
}

async function saveScheduleItem() {
  if (!scheduleFormValid.value) return
  scheduleModal.saving = true
  schedSaveError.value = ''

  try {
    const field = scheduleModal.field
    const source = field === 'itinerary' ? [...schedItinerary.value]
      : field === 'screenings' ? [...schedScreenings.value]
      : field === 'speakers' ? [...schedSpeakers.value]
      : field === 'features' ? [...schedFeatures.value]
      : [...schedDjs.value]

    const item = buildScheduleItem(field)
    if (!item) return

    if (scheduleModal.isNew) {
      // Keep existing id on screenings edit if not new
      source.push(item)
    } else {
      // Preserve original screening id on edit
      if (field === 'screenings' && source[scheduleModal.editIndex]?.id) {
        item.id = source[scheduleModal.editIndex].id
      }
      source[scheduleModal.editIndex] = item
    }

    // Sort itinerary by time string when saving
    if (field === 'itinerary') {
      source.sort((a, b) => {
        const toMin = (t) => {
          const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
          if (!m) return 0
          let h = parseInt(m[1], 10)
          const min = parseInt(m[2], 10)
          if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
          if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
          return h * 60 + min
        }
        return toMin(a.time) - toMin(b.time)
      })
    }

    // Sort speakers by time string when saving
    if (field === 'speakers') {
      source.sort((a, b) => {
        const toMin = (t) => {
          const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
          if (!m) return 0
          let h = parseInt(m[1], 10)
          const min = parseInt(m[2], 10)
          if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
          if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
          return h * 60 + min
        }
        return toMin(a.time) - toMin(b.time)
      })
    }

    await saveSchedule(field, source)
    scheduleModal.open = false
  } catch (err) {
    console.error('[AdminBBP] Failed to save schedule item:', err)
    schedSaveError.value = 'Failed to save. Please try again.'
  } finally {
    scheduleModal.saving = false
  }
}

async function deleteScheduleItem(field, idx) {
  if (!window.confirm('Delete this item?')) return
  schedSaveError.value = ''

  try {
    const source = field === 'itinerary' ? [...schedItinerary.value]
      : field === 'screenings' ? [...schedScreenings.value]
      : field === 'speakers' ? [...schedSpeakers.value]
      : field === 'features' ? [...schedFeatures.value]
      : [...schedDjs.value]
    source.splice(idx, 1)
    await saveSchedule(field, source)
  } catch (err) {
    console.error('[AdminBBP] Failed to delete schedule item:', err)
    schedSaveError.value = 'Failed to delete. Please try again.'
  }
}

// Feature reordering
async function moveFeatureUp(idx) {
  if (idx === 0) return
  const source = [...schedFeatures.value]
  const temp = source[idx]
  source[idx] = source[idx - 1]
  source[idx - 1] = temp
  try {
    await saveSchedule('features', source)
  } catch (err) {
    console.error('[AdminBBP] Failed to reorder features:', err)
    schedSaveError.value = 'Failed to reorder. Please try again.'
  }
}

async function moveFeatureDown(idx) {
  if (idx === schedFeatures.value.length - 1) return
  const source = [...schedFeatures.value]
  const temp = source[idx]
  source[idx] = source[idx + 1]
  source[idx + 1] = temp
  try {
    await saveSchedule('features', source)
  } catch (err) {
    console.error('[AdminBBP] Failed to reorder features:', err)
    schedSaveError.value = 'Failed to reorder. Please try again.'
  }
}

// Trigger schedule load when admin switches to schedule tab
watch(selectedRole, (val) => {
  if (val === 'schedule') loadSchedule()
  if (val === 'features') loadSchedule()
  if (val === 'flyer') loadSchedule()
})

// ── Flyer Generator ─────────────────────────────────────────────────────────
const selectedFlyerPreset = ref('poster')

const customPoster = reactive({
  title: 'Bitcoin Block Party',
  subtitle: '',
  body: '',
  footer: ''
})

function printFlyer() {
  window.print()
}
</script>

<style scoped>
.bbp-admin {
  min-height: 100vh;
  background: #0a0a0a;
  color: #e0e0e0;
  font-family: var(--bbp-font-family);
}

/* Auth States */
.auth-required,
.access-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
}

.auth-required h2,
.access-denied h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #f7931a;
}

.login-button,
.back-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: #f7931a;
  color: #000;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.login-button:hover,
.back-button:hover {
  transform: scale(1.05);
}

/* Admin Interface */
.admin-interface {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.back-link {
  color: #f7931a;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.back-link:hover {
  text-decoration: underline;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0.5rem 0;
  color: #f7931a;
}

.header p {
  color: #888;
  font-size: 1rem;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f7931a;
}

.stat-subvalue {
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 0.25rem;
}

.bbp-attendee-count {
  font-size: 0.85rem;
  color: #aaa;
}

.attendee-source {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #888;
  text-transform: lowercase;
}

.bbp-attendees-table .table-header,
.bbp-attendees-table .applicant-row {
  grid-template-columns: 1.5fr 1.8fr 1.2fr 1fr;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.95rem;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.filter-tab:hover {
  color: #f7931a;
}

.filter-tab.active {
  color: #f7931a;
  border-bottom-color: #f7931a;
}

/* Controls */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.controls-left {
  display: flex;
  gap: 1rem;
  flex: 1;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.status-filter input {
  cursor: pointer;
}

.search-input {
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: #f7931a;
}

.btn-add-new {
  padding: 0.75rem 1.5rem;
  background: #f7931a;
  color: #000;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-new:hover {
  background: #ff9f1a;
  transform: translateY(-1px);
}

.btn-add-new:active {
  transform: translateY(0);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #f7931a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Applicants Table */
.applicants-table {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.5fr 0.8fr 1fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem;
  background: #111;
  border-bottom: 1px solid #333;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
}

.applicant-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1.5fr 0.8fr 1fr 1fr 1.5fr;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #222;
  transition: background 0.2s;
}

.applicant-row:hover {
  background: #151515;
}

.applicant-row.confirmed {
  opacity: 0.7;
}

.col-name strong {
  display: block;
  margin-bottom: 0.25rem;
}

.role-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.sponsor {
  background: rgba(247, 147, 26, 0.2);
  color: #f7931a;
}

.role-badge.vendor {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.role-badge.food_truck {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.role-badge.volunteer {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.contact-item {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.contact-warning {
  color: #ff9800;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.tier-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.org-url {
  margin-top: 0.35rem;
  font-size: 0.8rem;
}

.org-url a {
  color: #4a9eff;
  text-decoration: none;
  transition: color 0.2s;
}

.org-url a:hover {
  color: #6bb0ff;
  text-decoration: underline;
}

/* Ordinal Column */
.col-ordinal {
  display: flex;
  align-items: center;
}

.ordinal-input {
  width: 60px;
  padding: 0.4rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.9rem;
  text-align: center;
}

.ordinal-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ordinal-input::placeholder {
  color: #555;
  font-size: 0.75rem;
}

/* Display Order Column */
.col-order {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-input {
  width: 60px;
  padding: 0.4rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 0.9rem;
  text-align: center;
}

.order-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.order-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-order-move {
  width: 24px;
  height: 18px;
  padding: 0;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 3px;
  color: #f7931a;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-order-move:hover:not(:disabled) {
  background: #f7931a;
  color: #000;
  border-color: #f7931a;
}

.btn-order-move:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.order-saving {
  font-size: 0.75rem;
  color: #4caf50;
  font-style: italic;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.status-badge.confirmed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.onboarding-info {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.btn-onboard,
.btn-resend {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-onboard {
  background: #f7931a;
  color: #000;
}

.btn-onboard:hover:not(:disabled) {
  background: #ff9f2e;
  transform: translateY(-1px);
}

.btn-onboard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-resend {
  background: #444;
  color: #e0e0e0;
}

.btn-resend:hover:not(:disabled) {
  background: #555;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #4caf50;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.missing-contact-warning {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #ff9800;
  padding: 0.5rem;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 6px;
}

.btn-edit-contact {
  padding: 0.4rem 0.8rem;
  background: #f7931a;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-edit-contact:hover {
  background: #ff9f2e;
  transform: translateY(-1px);
}

.content-edit-wrapper {
  margin-bottom: 0.5rem;
}

.btn-edit-content {
  padding: 0.4rem 0.8rem;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit-content:hover {
  background: #42a5f5;
  transform: translateY(-1px);
}

/* Edit Contact Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-content--wide {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #f7931a;
}

.modal-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #f7931a;
}

.modal-body {
  padding: 1.5rem;
}

.modal-subtitle {
  color: #888;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.edit-field {
  margin-bottom: 1.25rem;
}

.edit-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #aaa;
}

.edit-field label .optional {
  font-weight: 400;
  color: #666;
  font-size: 0.85rem;
}

.edit-input {
  width: 100%;
  padding: 0.75rem;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;
}

.edit-input:focus {
  outline: none;
  border-color: #f7931a;
}

.edit-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #222;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #f7931a;
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #333;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid #555;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #222;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #f7931a;
  border: none;
  border-radius: 6px;
  color: #000;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #ff9f2e;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  padding: 4rem;
  text-align: center;
  color: #666;
}

/* Responsive */
@media (max-width: 1200px) {
  .table-header,
  .applicant-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .col-name,
  .col-contact,
  .col-org,
  .col-status,
  .col-actions {
    display: flex;
    flex-direction: column;
  }
}

/* ── Schedule Editor ──────────────────────────────────────────────────────── */
.schedule-editor {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 1rem;
}

.sched-section {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  overflow: hidden;
}

.sched-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
}

.sched-section-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f7931a;
  margin: 0;
}

.btn-add {
  background: #f7931a;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-add:hover {
  opacity: 0.85;
}

.sched-empty {
  padding: 1.5rem 1.25rem;
  color: #666;
  font-size: 0.9rem;
}

.sched-list {
  display: flex;
  flex-direction: column;
}

.sched-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #1e1e1e;
  flex-wrap: wrap;
}

.sched-row:last-child {
  border-bottom: none;
}

.sched-time {
  color: #f7931a;
  font-weight: 700;
  font-size: 0.85rem;
  min-width: 7rem;
  white-space: nowrap;
}

.sched-label {
  flex: 1;
  font-size: 0.95rem;
  color: #e0e0e0;
}

.sched-note {
  color: #888;
  font-size: 0.85rem;
}

.sched-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

.btn-sched-edit,
.btn-sched-delete {
  border: none;
  border-radius: 5px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-sched-edit {
  background: #2a2a2a;
  color: #ccc;
}

.btn-sched-edit:hover {
  background: #3a3a3a;
}

.btn-sched-delete {
  background: #3b1010;
  color: #f88;
}

.btn-sched-delete:hover {
  background: #5a1a1a;
}

/* Film row variant */
.sched-row--film {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.sched-film-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sched-film-title {
  color: #e0e0e0;
  font-size: 0.95rem;
}

.sched-film-dir {
  color: #888;
  font-size: 0.85rem;
}

.sched-film-desc {
  color: #aaa;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.sched-dj-url {
  font-size: 0.8rem;
  color: #888;
  word-break: break-all;
}

/* Speaker row variant */
.sched-row--speaker {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.sched-speaker-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sched-speaker-name {
  color: #e0e0e0;
  font-size: 0.95rem;
}

.sched-speaker-company {
  color: #888;
  font-size: 0.85rem;
}

.sched-speaker-topic {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.sched-speaker-bio {
  color: #aaa;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

/* Textarea in modal */
.edit-textarea {
  resize: vertical;
  min-height: 6rem;
  font-family: inherit;
  line-height: 1.5;
}

.optional {
  color: #666;
  font-size: 0.8rem;
  font-weight: 400;
}

/* ── Flyer Generator ────────────────────────────────────────────────────── */
.flyer-generator {
  margin-top: 1rem;
}

.flyer-header {
  margin-bottom: 2rem;
}

.flyer-header h2 {
  font-size: 1.75rem;
  color: #f7931a;
  margin: 0 0 0.5rem 0;
}

.flyer-header p {
  color: #888;
  font-size: 0.95rem;
  margin: 0;
}

.flyer-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.flyer-controls label {
  font-size: 0.9rem;
  color: #aaa;
  font-weight: 600;
}

.flyer-preset-select {
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  font-family: var(--bbp-font-family);
}

.flyer-preset-select:hover {
  border-color: #f7931a;
}

.btn-print {
  background: #f7931a;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-left: auto;
  font-family: var(--bbp-font-family);
}

.btn-print:hover {
  background: #ff9e2a;
  transform: scale(1.02);
}

.flyer-preview {
  background: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  overflow: auto;
  max-height: 90vh;
}

.flyer-page {
  margin: 0 auto;
  background: white;
  color: #000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
  box-sizing: border-box;
  position: relative;
}

/* Poster Styles */
.page--poster {
  width: 11in;
  height: 17in;
  min-width: 11in;
  min-height: 17in;
  max-width: 11in;
  max-height: 17in;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  margin: 0 auto;
}

.poster-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-overlay {
  position: absolute;
  top: 31.3%;
  left: 15%;
  width: 70%;
  height: 37.3%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'Rigid Square Bold', sans-serif;
  box-sizing: border-box;
}

.poster-eyebrow {
  font-size: 0.85rem;
  color: #074db3;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.poster-date-block {
  font-size: 1.4rem;
  color: #091931;
  font-weight: 700;
  margin: 0 0 0.3rem 0;
}

.poster-venue-block {
  font-size: 0.95rem;
  color: #074db3;
  margin: 0 0 1rem 0;
}

.poster-divider {
  width: 60%;
  height: 2px;
  background: #f7d303;
  margin: 0.5rem 0;
}

.poster-schedule-title {
  font-size: 1.1rem;
  color: #091931;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem 0;
}

.poster-schedule {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.poster-schedule-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #091931;
}

.poster-schedule-time {
  font-weight: 700;
  text-align: left;
  flex: 0 0 auto;
  min-width: 5rem;
}

.poster-schedule-label {
  text-align: right;
  flex: 1;
}

.poster-cta-row {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.75rem;
  color: #074db3;
  font-weight: 700;
}

.poster-sponsor-row {
  margin-top: 0.75rem;
  font-size: 0.65rem;
  color: #666;
}

/* Handout Styles */
.page--handout {
  width: 5.5in;
  height: 8.5in;
  min-width: 5.5in;
  min-height: 8.5in;
  max-width: 5.5in;
  max-height: 8.5in;
  padding: 1in 0.6in;
  font-family: 'Rigid Square Bold', sans-serif;
  box-sizing: border-box;
  margin: 0 auto;
}

.handout-eyebrow {
  font-size: 0.7rem;
  color: #074db3;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.handout-title {
  font-size: 2.5rem;
  color: #091931;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

.handout-date {
  font-size: 0.95rem;
  color: #091931;
  font-weight: 700;
  margin: 0.5rem 0 0.25rem 0;
}

.handout-venue {
  font-size: 0.8rem;
  color: #074db3;
  margin: 0 0 1rem 0;
}

.handout-divider {
  width: 100%;
  height: 2px;
  background: #f7d303;
  margin: 1rem 0;
}

.handout-section-title {
  font-size: 1rem;
  color: #091931;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.handout-schedule-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: #091931;
  margin-bottom: 0.2rem;
}

.handout-sched-time {
  font-weight: 700;
}

.handout-body {
  font-size: 0.75rem;
  color: #333;
  line-height: 1.5;
  margin: 1rem 0;
}

.handout-cta {
  font-size: 0.85rem;
  color: #074db3;
  font-weight: 700;
  margin: 0.5rem 0;
}

.handout-wallet-note {
  font-size: 0.65rem;
  color: #666;
  margin: 0.5rem 0;
}

.handout-footer {
  font-size: 0.6rem;
  color: #888;
  margin-top: 1rem;
}

/* Schedule Poster Styles */
.page--schedule {
  width: 8.5in;
  height: 11in;
  min-width: 8.5in;
  min-height: 11in;
  max-width: 8.5in;
  max-height: 11in;
  padding: 1in 0.75in;
  font-family: 'Rigid Square Bold', sans-serif;
  box-sizing: border-box;
  margin: 0 auto;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #f7d303;
}

.schedule-header-left h1 {
  font-size: 2rem;
  color: #091931;
  margin: 0;
}

.schedule-header-left p {
  font-size: 0.85rem;
  color: #074db3;
  margin: 0.25rem 0 0 0;
}

.schedule-header-right {
  text-align: right;
  font-size: 0.8rem;
  color: #074db3;
  line-height: 1.6;
}

.schedule-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-table-header {
  display: flex;
  font-size: 0.85rem;
  color: #074db3;
  font-weight: 700;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f7d303;
}

.schedule-table-header span:first-child {
  flex: 0 0 8rem;
}

.schedule-table-header span:last-child {
  flex: 1;
}

.schedule-entry {
  display: flex;
  font-size: 0.8rem;
  color: #091931;
  padding: 0.4rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.schedule-entry .sched-time {
  flex: 0 0 8rem;
  font-weight: 700;
}

.schedule-entry .sched-label {
  flex: 1;
}

.schedule-entry .sched-note {
  color: #333;
  font-style: italic;
}

.schedule-footer {
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 2px solid #f7d303;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #074db3;
}

.flyer-help {
  margin-top: 2rem;
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
}

.flyer-help p {
  margin: 0 0 0.75rem 0;
  color: #aaa;
  font-size: 0.9rem;
}

.flyer-help p:last-of-type {
  margin-bottom: 0.5rem;
}

.flyer-help strong {
  color: #f7931a;
}

.flyer-help-list {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  color: #aaa;
  font-size: 0.85rem;
  line-height: 1.6;
}

.flyer-help-list li {
  margin-bottom: 0.25rem;
}

.flyer-help-list strong {
  color: #e0e0e0;
}

/* Wayfinding Sign (Landscape) */
.page--wayfinding {
  width: 11in;
  height: 8.5in;
  min-width: 11in;
  min-height: 8.5in;
  max-width: 11in;
  max-height: 8.5in;
  background: #074db3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rigid Square Bold', sans-serif;
  box-sizing: border-box;
  padding: 1in;
  margin: 0 auto;
}

.wayfinding-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  text-align: left;
}

.wayfinding-arrow {
  font-size: 12rem;
  color: #f7d303;
  line-height: 1;
  font-weight: 900;
}

.wayfinding-title {
  font-size: 3.5rem;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.1;
}

.wayfinding-venue {
  font-size: 1.5rem;
  color: #f7d303;
  margin: 0 0 0.5rem 0;
}

.wayfinding-detail {
  font-size: 1.1rem;
  color: white;
  margin: 0;
}

/* Simple Direction Arrow */
.page--simple-arrow {
  width: 8.5in;
  height: 11in;
  min-width: 8.5in;
  min-height: 11in;
  max-width: 8.5in;
  max-height: 11in;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rigid Square Bold', sans-serif;
  border: 0.5in solid #074db3;
  box-sizing: border-box;
  margin: 0 auto;
}

.simple-arrow-content {
  text-align: center;
}

.simple-arrow {
  font-size: 15rem;
  color: #f7931a;
  line-height: 1;
  font-weight: 900;
  margin-bottom: 1rem;
}

.simple-arrow-title {
  font-size: 2.5rem;
  color: #091931;
  margin: 0 0 1rem 0;
  line-height: 1.1;
}

.simple-arrow-detail {
  font-size: 1.8rem;
  color: #074db3;
  margin: 0;
  font-weight: 700;
}

/* No Alcohol Sign */
.page--no-alcohol {
  width: 11in;
  height: 8.5in;
  min-width: 11in;
  min-height: 8.5in;
  max-width: 11in;
  max-height: 8.5in;
  background: #f82909;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rigid Square Bold', sans-serif;
  box-sizing: border-box;
  padding: 1in;
  margin: 0 auto;
}

.no-alcohol-content {
  text-align: center;
  color: white;
}

.no-alcohol-icon {
  font-size: 8rem;
  margin-bottom: 1rem;
  line-height: 1;
}

.no-alcohol-title {
  font-size: 5rem;
  color: white;
  margin: 0 0 0.5rem 0;
  font-weight: 900;
  text-transform: uppercase;
}

.no-alcohol-subtitle {
  font-size: 3.5rem;
  color: white;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
  text-transform: uppercase;
}

.no-alcohol-detail {
  font-size: 1.5rem;
  color: white;
  margin: 2rem 0 0 0;
  opacity: 0.9;
}

.no-alcohol-footer {
  font-size: 1rem;
  color: white;
  margin: 2rem 0 0 0;
  opacity: 0.7;
}

/* Custom Poster */
.custom-poster-editor {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.custom-poster-editor h3 {
  color: #f7931a;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.custom-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page--custom {
  width: 11in;
  height: 17in;
  min-width: 11in;
  min-height: 17in;
  max-width: 11in;
  max-height: 17in;
  background: linear-gradient(135deg, #074db3 0%, #091931 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rigid Square Bold', sans-serif;
  padding: 2in;
  box-sizing: border-box;
  margin: 0 auto;
}

.custom-poster-content {
  text-align: center;
  color: white;
  width: 100%;
}

.custom-title {
  font-size: 4.5rem;
  color: #f7d303;
  margin: 0 0 1rem 0;
  line-height: 1.1;
  font-weight: 900;
}

.custom-subtitle {
  font-size: 2.5rem;
  color: white;
  margin: 0 0 2rem 0;
  line-height: 1.2;
}

.custom-body {
  font-size: 1.5rem;
  color: white;
  line-height: 1.6;
  margin: 2rem 0;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.custom-footer {
  font-size: 1.2rem;
  color: #f7d303;
  margin: 2rem 0 0 0;
  font-weight: 700;
}

.custom-branding {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 3px solid #f7d303;
}

.custom-branding p {
  font-size: 0.9rem;
  color: white;
  margin: 0;
  opacity: 0.7;
}

/* Print Styles */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  body {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .bbp-admin {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Hide all admin interface elements */
  .header,
  .stats-overview,
  .filter-tabs,
  .controls,
  .flyer-controls,
  .flyer-help,
  .flyer-header {
    display: none !important;
  }

  .admin-interface {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
  }

  .flyer-generator {
    margin: 0 !important;
    padding: 0 !important;
  }

  .flyer-preview {
    padding: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    margin: 0 !important;
    max-height: none !important;
    border-radius: 0 !important;
  }

  .flyer-page {
    box-shadow: none !important;
    page-break-after: always;
    page-break-inside: avoid;
    margin: 0 auto !important;
    padding: 0;
    display: block !important;
    position: relative !important;
  }

  /* Exact print dimensions - preserve all layout properties */
  .page--poster,
  .page--custom {
    width: 11in !important;
    height: 17in !important;
    min-height: 17in !important;
    max-width: 11in !important;
    min-width: 11in !important;
    max-height: 17in !important;
    box-sizing: border-box !important;
    margin: 0 auto !important;
  }

  .page--poster {
    padding: 0 !important;
  }

  .page--custom {
    padding: 2in !important;
  }

  .page--handout {
    width: 5.5in !important;
    height: 8.5in !important;
    min-height: 8.5in !important;
    max-width: 5.5in !important;
    min-width: 5.5in !important;
    max-height: 8.5in !important;
    padding: 1in 0.6in !important;
    box-sizing: border-box !important;
    margin: 0 auto !important;
  }

  .page--schedule,
  .page--simple-arrow {
    width: 8.5in !important;
    height: 11in !important;
    min-height: 11in !important;
    max-width: 8.5in !important;
    min-width: 8.5in !important;
    max-height: 11in !important;
    box-sizing: border-box !important;
    margin: 0 auto !important;
  }

  .page--schedule {
    padding: 1in 0.75in !important;
  }

  .page--simple-arrow {
    padding: 0 !important;
    border: 0.5in solid #074db3 !important;
  }

  .page--wayfinding,
  .page--no-alcohol {
    width: 11in !important;
    height: 8.5in !important;
    min-height: 8.5in !important;
    max-width: 11in !important;
    min-width: 11in !important;
    max-height: 8.5in !important;
    padding: 1in !important;
    box-sizing: border-box !important;
    margin: 0 auto !important;
  }

  /* Hide custom editor controls in print */
  .custom-poster-editor {
    display: none !important;
  }

  /* Preserve all positioning and sizing */
  .poster-bg {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .poster-overlay {
    position: absolute !important;
    top: 31.3% !important;
    left: 15% !important;
    width: 70% !important;
    height: 37.3% !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }

  /* Preserve flex layouts */
  .page--wayfinding,
  .page--no-alcohol,
  .page--simple-arrow,
  .page--custom {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .wayfinding-content {
    display: flex !important;
    align-items: center !important;
    gap: 2rem !important;
  }

  /* Don't override text centering - let parent flex handle it */
  .simple-arrow-content,
  .no-alcohol-content,
  .custom-poster-content {
    text-align: center !important;
  }

  /* Preserve schedule table layout */
  .schedule-header,
  .schedule-table,
  .schedule-table-header,
  .schedule-entry,
  .schedule-footer {
    display: flex !important;
  }

  .schedule-header {
    justify-content: space-between !important;
    align-items: flex-start !important;
  }

  .schedule-table {
    flex-direction: column !important;
  }

  .schedule-footer {
    justify-content: space-between !important;
  }

  /* Preserve handout layout */
  .handout-header {
    margin-bottom: 1rem !important;
  }

  /* Preserve poster schedule rows */
  .poster-schedule,
  .poster-schedule-row,
  .poster-cta-row {
    display: flex !important;
  }

  .poster-schedule {
    flex-direction: column !important;
  }

  .poster-schedule-row,
  .poster-cta-row {
    justify-content: space-between !important;
  }

  /* Preserve handout schedule rows */
  .handout-schedule-row {
    display: flex !important;
    justify-content: space-between !important;
  }

  /* Preserve backgrounds and colors */
  .page--poster,
  .page--handout,
  .page--schedule,
  .page--wayfinding,
  .page--no-alcohol,
  .page--simple-arrow,
  .page--custom {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    margin: 0;
    size: auto;
  }
}
</style>
