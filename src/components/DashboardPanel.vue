<template>
  <div class="dashboard">
    <!-- Ticket Transfer Modal -->
    <div
      v-if="showTransferModal"
      class="loading-overlay"
      style="z-index:9999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;"
      @click.self="showTransferModal = false"
    >
      <div style="background:#1f1e22;border:1px solid #4a90d9;border-radius:12px;padding:2rem;max-width:480px;width:90%;color:white;">
        <h2 style="margin-top:0;">\ud83c\udfab Transfer Ticket</h2>
        <p v-if="transferTargetApplicant" style="color:orange;">
          From: <strong>{{ transferTargetApplicant.contact?.fullname || transferTargetApplicant.id_code }}</strong>
          &nbsp;|&nbsp; Available: <strong>{{ transferTargetApplicant.ticket_quantity }}</strong>
        </p>
        <label style="display:block;margin-bottom:4px;font-size:0.9rem;">Recipient Full Name:</label>
        <input
          type="text"
          v-model="transferForm.recipientFullname"
          placeholder="Jane Smith"
          style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #4a90d9;background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;box-sizing:border-box;"
        />
        <label style="display:block;margin-bottom:4px;font-size:0.9rem;">Recipient Email:</label>
        <input
          type="email"
          v-model="transferForm.recipientEmail"
          placeholder="jane@example.com"
          style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #4a90d9;background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;box-sizing:border-box;"
        />
        <label style="display:block;margin-bottom:4px;font-size:0.9rem;">Recipient Phone:</label>
        <input
          type="tel"
          v-model="transferForm.recipientPhone"
          placeholder="+1 (555) 555-5555"
          style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #4a90d9;background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;box-sizing:border-box;"
        />
        <label style="display:block;margin-bottom:4px;font-size:0.9rem;">Recipient ID_CODE <span style="color:#aaa;font-size:0.8rem;">(optional)</span>:</label>
        <input
          type="text"
          v-model="transferForm.recipientIdCode"
          placeholder="e.g. abc12"
          style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #4a90d9;background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;box-sizing:border-box;"
        />
        <label style="display:block;margin-bottom:4px;font-size:0.9rem;">Number of Tickets:</label>
        <input
          type="number"
          v-model.number="transferForm.nTickets"
          :min="1"
          :max="transferTargetApplicant ? transferTargetApplicant.ticket_quantity : 1"
          style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid #4a90d9;background:#111;color:white;font-size:1rem;margin-bottom:1rem;box-sizing:border-box;"
        />
        <div style="display:flex;gap:0.5rem;">
          <button
            @click="submitAdminTransfer"
            :disabled="isTransferSubmitting"
            style="background-color:#4a90d9;flex:1;"
          >
            {{ isTransferSubmitting ? 'Transferring...' : '\ud83c\udfab Confirm Transfer' }}
          </button>
          <button
            @click="showTransferModal = false"
            style="background:transparent;color:white;border:1px solid white;flex:1;"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Add loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      Loading applicants...
    </div>

    <!-- Add error display -->
    <div v-if="error" class="error-banner">
      {{ error }}
      <button @click="error = null">×</button>
    </div>

    <div class="banner">
      <a href="/">
        <img src="@/assets/images/festivall_emblem_white.png" alt="Festivall Logo" class="logo" />
      </a>
      <h1>DASHBOARD</h1>
      <div class="scanner-links">
        <RouterLink to="/reunionticketscanner" class="scanner-link">
          <img
            :src="ticket_icon"
            alt="Ticket Scanner"
            class="action-icon"
            style="transform: translateY(8px) rotate(-45deg); width: 32px"
          />
          Ticket Scanner
        </RouterLink>

        <RouterLink to="/reunionmealscanner" class="scanner-link">
          <img :src="meal_icon" alt="Meal Scanner" class="action-icon" style="width: 32px" />
          Meal Scanner
        </RouterLink>

        <RouterLink to="/reunionlineup" class="scanner-link">
          <img :src="lineup_icon" alt="Lineup Scanner" class="action-icon" style="width: 32px" />
          Reunion Lineup
        </RouterLink>

        <RouterLink to="/admin/volunteer-tasks" class="scanner-link">
          <img
            :src="volunteer_icon"
            alt="Volunteer Shifts"
            class="action-icon"
            style="width: 32px"
          />
          Volunteer Shifts
        </RouterLink>

        <RouterLink to="/scavengerhunt/a2c4e?fullName=Admin" class="scanner-link">
          <img
            :src="scavenger_hunt_icon"
            alt="Scavenger Hunt Scanner"
            class="action-icon"
            style="width: 32px"
          />
          Scavenger Hunt
        </RouterLink>

        <RouterLink to="/admin/tasks" class="scanner-link">
          <img :src="task_icon" alt="Task Manager" class="action-icon" style="width: 24px" />
          Task Manager
        </RouterLink>

        <RouterLink to="/dashboard/budget" class="scanner-link">
          <img :src="budget_icon" alt="Budget" class="action-icon" style="width: 30px" />
          Budget Manager
        </RouterLink>

        <RouterLink to="/admin/inventory" class="scanner-link">
          <img :src="inventory_icon" alt="Inventory" class="action-icon" style="width: 28px" />
          Inventory
        </RouterLink>

        <RouterLink to="/reunionmap" class="scanner-link">
          <img :src="map_icon" alt="Grounds Map" class="action-icon" style="width: 32px" />
          Grounds Map
        </RouterLink>

        <RouterLink to="/reunionreceipttracker" class="scanner-link">
          <img :src="receipt_icon" alt="Receipt Tracker" class="action-icon" style="width: 30px" />
          Receipt Tracker
        </RouterLink>
      </div>
    </div>

    <div class="controls">
      <h2>Ticket Pool</h2>
      <div class="buttons">
        <button @click="loadApplicants('orders_2025', true)">Reunion Orders 2025</button>
        <button @click="loadApplicants('participants_2026', true)">
          Reunion Participants 2026
        </button>
      </div>
      <!-- <h2>Talent Pool</h2> -->
      <div class="buttons">
        <!-- <button @click="loadApplicants('leads', true)">Festivall Leads</button> -->
      </div>
    </div>

    <div class="filters">
      <h2>Filter By</h2>
      <!-- Add search bar -->
      <div class="search-section">
        <input
          v-model="searchQuery"
          placeholder="Search by name, email, or ID..."
          class="search-input"
        />
      </div>
      <div class="buttons">
        <button
          v-for="filter in relevantFilters"
          :key="`${filter.property}-${filter.value}`"
          @click="applyFilter(filter.property, filter.value)"
          :class="{ 'active-filter': isFilterActive(filter.property, filter.value) }"
        >
          {{ filter.label }}
        </button>
        <button @click="clearFilters">Clear Filters</button>
      </div>
    </div>
    <div class="dashboard-panel">
      <div class="export-buttons">
        <button @click="exportContactsCSV">Export Phone Numbers</button>
        <button @click="exportEmailsCSV">Export Emails</button>
        <button @click="exportPosterText">Export Poster Text</button>
        <button @click="exportMealRedemptionData">Export Meal Service Data</button>
        <button @click="exportEntranceActivityData">Export Entrance Activity Data</button>
        <!-- <button @click="generateLineup">Download .ics</button> -->
      </div>
      <h2>Current View <br />{{ searchedApplicants?.length || 0 }}</h2>

      <!-- Add pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="currentPage--" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
      </div>

      <div class="applicants">
        <div
          v-for="applicant in paginatedApplicants"
          :key="applicant.id"
          class="applicant"
          :class="{ collapsed: !expandedCards.has(applicant.id_code || applicant.id) }"
        >
          <!-- Mobile-only collapse header -->
          <div class="card-header" @click="toggleCard(applicant.id_code || applicant.id)">
            <div class="card-header-info">
              <strong>{{ applicant.act_name || applicant.fullname || applicant.email?.split('@')[0] }}</strong>
              <span v-if="applicant.id_code" class="id_code">&nbsp;#{{ applicant.id_code }}</span>
              <span v-if="applicant.applicant_types?.length" class="card-types"> · {{ applicant.applicant_types.join(', ') }}</span>
            </div>
            <span class="card-toggle-btn">{{ expandedCards.has(applicant.id_code || applicant.id) ? '▲' : '▼' }}</span>
          </div>
          <!-- Detail page link icon -->
          <div
            class="detail-link-icon"
            @click="goToApplicantPage(applicant.id_code || applicant.id)"
            title="View detailed information"
          >
            📋
          </div>
          <!-- Contract status chip -->
          <div class="contract-chip">
            <span v-if="applicant.contract_signed" class="contract-chip-signed">✓ Signed</span>
            <button
              v-else
              class="contract-chip-unsigned"
              :class="{ 'contract-chip-confirm': contractRemindPending.has(applicant.id_code) }"
              @click.stop="triggerContractRemind(applicant.id_code)"
            >
              <span v-if="!contractRemindPending.has(applicant.id_code)">✗ Unsigned</span>
              <span v-else>Send reminder?</span>
            </button>
          </div>
          <div class="applicant-content">
            <div class="name-section">
              <h2>
                <!-- ACT NAME OR FULLNAME -->
                <a
                  v-if="applicant.url || applicant.act_website"
                  :href="applicant.url || applicant.act_website"
                  target="_blank"
                  style="text-decoration: underline"
                >
                  {{ applicant.act_name || applicant.fullname }}
                </a>
                <!-- EMAIL PREFIX FALL BACK -->
                <span v-else style="text-decoration: underline">
                  {{ applicant.fullname || applicant.email.split('@')[0] }}
                </span>
              </h2>
              <!-- ID CODE -->
              <p v-if="applicant.id_code" class="id_code">
                <a
                  :href="
                    currentCollection === 'participants_2026'
                      ? 'https://console.firebase.google.com/u/0/project/reunionfestivall/firestore/databases/-default-/data/~2Fparticipants_2026~2F' +
                        applicant.id_code
                      : 'https://console.firebase.google.com/u/0/project/reunionfestivall/firestore/databases/-default-/data/~2Forders_2025~2F' +
                        applicant.id_code
                  "
                  target="_blank"
                >
                  #{{ applicant.id_code }}
                </a>
              </p>
              <!-- APPLICANT TYPE -->
              <p
                v-if="applicant.applicant_types && applicant.applicant_types.length"
                class="applicant-types"
              >
                <strong>Types:</strong> {{ applicant.applicant_types.join(', ') }}
              </p>
            </div>

            <!-- GENRE -->
            <img
              v-if="applicant.applicant_types && applicant.applicant_types.includes('Artist')"
              :src="artist_icon"
              alt="Artist Icon"
              class="section-icon"
            />
            <p v-if="applicant.act_name">{{ applicant.act_name }}</p>
            <p v-if="applicant.act_type">{{ applicant.act_type }}</p>
            <p v-if="applicant.genre">{{ applicant.genre }}</p>
            <p v-if="applicant.act_description">{{ applicant.act_description }}</p>
            <!-- ACT WEBSITE -->
            <a
              v-if="applicant.act_website"
              :href="applicant.act_website"
              target="_blank"
              style="text-decoration: underline"
            >
              Website
            </a>

            <!-- SOCIAL URL -->
            <a
              v-if="applicant.social_url"
              :href="applicant.social_url"
              target="_blank"
              style="text-decoration: underline"
            >
              Socials
            </a>

            <!-- PRESS KIT URL -->
            <a
              v-if="applicant.press_kit_url"
              :href="applicant.press_kit_url"
              target="_blank"
              style="text-decoration: underline"
            >
              Press Kit
            </a>

            <!-- VOLUNTEER SECTION -->
            <img
              v-if="applicant.applicant_types && applicant.applicant_types.includes('Volunteer')"
              :src="volunteer_icon"
              alt="Volunteer Icon"
              class="section-icon"
            />
            <p v-if="applicant.volunteer_type">{{ applicant.volunteer_type }}</p>

            <!-- WORKSHOP SECTION -->
            <img
              v-if="applicant.applicant_types && applicant.applicant_types.includes('Workshop')"
              :src="workshop_icon"
              alt="Workshop Icon"
              class="section-icon"
            />
            <p v-if="applicant.workshop_title">{{ applicant.workshop_title }}</p>
            <p v-if="applicant.workshop_description">{{ applicant.workshop_description }}</p>

            <!-- ART INSTALLATION SECTION -->
            <img
              v-if="
                applicant.applicant_types && applicant.applicant_types.includes('Art Installation')
              "
              :src="art_installation_icon"
              alt="Art Installation Icon"
              class="section-icon"
            />
            <p v-if="applicant.installation_title">
              {{ applicant.installation_title }}
            </p>
            <p v-if="applicant.installation_description">
              {{ applicant.installation_description }}
            </p>
            <p v-if="applicant.space_requirements">
              {{ applicant.space_requirements }}
            </p>
            <p v-if="applicant.other_requirements">
              {{ applicant.other_requirements }}
            </p>

            <!-- VENDOR SECTION -->
            <img
              v-if="applicant.applicant_types && applicant.applicant_types.includes('Vendor')"
              :src="vendor_icon"
              alt="Vendor Icon"
              class="section-icon"
            />

            <p v-if="applicant.vendor_type">{{ applicant.vendor_type }}</p>
            <p v-if="applicant.vendor_description">
              {{ applicant.vendor_description }}
            </p>
            <a
              v-if="applicant.vendor_url"
              :href="applicant.vendor_url"
              target="_blank"
              style="text-decoration: underline"
            >
              {{ applicant.vendor_url }}
            </a>

            <!-- BIO -->
            <p>{{ applicant.bio }}</p>
            <!-- STATEMENT -->
            <p
              v-if="applicant.statement"
              style="border: 1px dotted var(--festivall-baby-blue); border-radius: 5px"
            >
              <strong>Statement:</strong>
              {{ applicant.statement }}
            </p>
            <!-- COMMENTS -->
            <span v-if="applicant.comments">{{ applicant.comments }} </span>
          </div>
          <!-- TICKET DATA -->
          <div
            v-if="
              applicant.payment_type &&
              (applicant.ticket_quantity > 0 ||
                applicant.total_price ||
                applicant.paid !== undefined)
            "
            class="ticket-content"
          >
            <div class="payment-section">
              <div class="status-row">
                <span class="status-label">Payment:</span>
                <span v-if="applicant.paid" class="status-badge status-ok">Paid</span>
                <span v-else class="status-badge status-bad">Unpaid</span>
              </div>
              <div class="card-action-row" v-if="applicant.paid">
                <button @click="revokeTicket(applicant.id_code)" class="card-btn-danger">Revoke Ticket</button>
                <button v-if="applicant.ticket_quantity > 0" @click="openTransferModal(applicant)" class="card-btn-primary">Transfer Ticket</button>
              </div>
              <div class="card-action-row" v-else>
                <a @click="remindPayment(applicant.id_code)">
                  <img :src="reminder_icon" alt="Remind Payment" class="action-icon" style="width:auto;height:24px;" />
                </a>
                <button @click="confirmPaymentReceived(applicant.id_code)" class="card-btn-success">Confirm Payment</button>
              </div>
            </div>
            <div class="checkedin-section">
              <!-- CHECKED IN STATUS -->
              <p v-if="applicant.checked_in">Checked In</p>
              <p v-else>Not Checked In</p>
              <!-- TICKET TYPE -->
              <p v-if="applicant.ticket_type">Ticket Type: {{ applicant.ticket_type }}</p>
            </div>
            <div class="quantities-section">
              <!-- TICKET QUANTITY -->
              <div class="quantity">
                <p><strong>Ticket Quantity:</strong>&nbsp;{{ applicant.ticket_quantity }}</p>
                <div class="tickets">
                  <img
                    v-for="n in Number(applicant.ticket_quantity) || 0"
                    :key="n"
                    :src="ticket_icon"
                    style="width: 32px; transform: rotate(-45deg)"
                    alt="Ticket Icon"
                    class="ticket-icon"
                  />
                </div>
              </div>
              <!-- MEAL TICKETS REMAINING -->
              <div class="quantity">
                <p><strong>Meal Tickets:</strong>&nbsp;{{ applicant.meal_tickets_remaining }}</p>
                <div class="meals">
                  <img
                    v-for="n in Number(applicant.meal_tickets_remaining) || 0"
                    :key="n"
                    :src="meal_icon"
                    style="width: 32px"
                    alt="Meal Icon"
                    class="meal-icon"
                  />
                </div>
              </div>
            </div>

            <div class="revenue-section">
              <!-- TOTAL PRICE -->
              <p v-if="applicant.total_price">
                Total Price:
                <span
                  v-if="
                    applicant.payment_type === 'inkind' || applicant.payment_type === 'etransfer'
                  "
                  >$</span
                >{{ applicant.total_price }}
                <span v-if="applicant.payment_type === 'bitcoin'">BTC</span>
              </p>
              <!-- PAYMENT TYPE -->
              <p v-if="applicant.payment_type">Payment Type: {{ applicant.payment_type }}</p>
            </div>
            <div class="preview-section">
              <!-- PREVIEW TICKET -->
              <button @click="previewTicket(applicant.id_code)" class="section-action-btn">Preview Ticket</button>
              <a
                :href="deliverTicket(applicant.email, applicant.fullname, applicant.id_code)"
                target="_blank"
              >
                <img
                  :src="ticket_icon"
                  alt="Deliver Ticket"
                  class="action-icon"
                  style="width: auto; height: 32px"
                />
              </a>
            </div>
          </div>
          <!-- DASHBOARD ACTIONS-->
          <div
            v-if="
              (applicant.applicant_types && applicant.applicant_types.length) ||
              applicant.contract_signed !== undefined ||
              applicant.phone ||
              applicant.rates
            "
            class="actions"
          >
            <a v-if="applicant.mix_track_url" :href="applicant.mix_track_url" target="_blank">
              <img :src="mixTrack_icon" alt="Listen to Mix/Track" class="action-icon" />
            </a>
            <div v-if="applicant.phone" class="message-section">
              <input type="text" v-model="applicant.message" placeholder="message applicant" />
              <img
                @click="sendSMS(applicant.phone, applicant.message), (applicant.message = '')"
                :src="sms_icon"
                alt="Send SMS"
                class="action-icon"
                style="width: auto; height: 42px"
              />
            </div>
            <div v-if="true" class="compensation-section">
              <!-- Left: inputs + current display -->
              <div class="comp-left">
                <div class="comp-monetary-row">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    v-model="applicant.comp_amount"
                    placeholder="Amount"
                    class="comp-amount-input"
                  />
                  <select v-model="applicant.comp_currency" class="comp-currency-select">
                    <option value="CAD">CAD</option>
                    <option value="USD">USD</option>
                    <option value="JPY">JPY</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
                <input
                  type="text"
                  v-model="applicant.comp_non_monetary"
                  placeholder="Non-monetary (e.g. weekend pass, accommodations, etc.)"
                  class="comp-text-input"
                />
                <div class="comp-addons">
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_tent" /> Tent</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_sleeping_bag" /> Sleeping Bag</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_airport_pickup" /> Airport Pickup</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_airport_dropoff" /> Airport Dropoff</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_shuttle" /> Shuttle</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_backline" /> Backline</label>
                  <label class="addon-toggle"><input type="checkbox" v-model="applicant.comp_accommodation" /> Accommodation</label>
                </div>
                <input
                  v-if="applicant.comp_accommodation"
                  type="text"
                  v-model="applicant.comp_accommodation_notes"
                  placeholder="Accommodation details (e.g. hostel on-site, room 4)"
                  class="comp-text-input"
                />
                <div class="comp-payment-method">
                  <span class="comp-payment-label">Preferred payment:</span>
                  <button
                    v-for="method in ['bitcoin', 'cash', 'etransfer']"
                    :key="method"
                    class="comp-payment-btn"
                    :class="`comp-payment-btn--${method}` + (applicant.comp_payment_method === method ? ' comp-payment-btn--active' : '')"
                    @click="applicant.comp_payment_method = applicant.comp_payment_method === method ? '' : method"
                  >{{ method === 'etransfer' ? 'E-Transfer' : method.charAt(0).toUpperCase() + method.slice(1) }}</button>
                </div>
                <!-- Current display: structured object -->
                <template v-if="applicant.rates && applicant.rates.monetary_currency !== undefined">
                  <p v-if="applicant.rates.monetary_amount" class="comp-current-line">
                    <strong>Fee:</strong> {{ applicant.rates.monetary_amount }} {{ applicant.rates.monetary_currency }}
                  </p>
                  <p v-if="applicant.rates.non_monetary" class="comp-current-line">
                    <strong>Non-monetary:</strong> {{ applicant.rates.non_monetary }}
                  </p>
                  <div v-if="applicant.rates.addons && (applicant.rates.addons.tent || applicant.rates.addons.sleeping_bag || applicant.rates.addons.airport_pickup || applicant.rates.addons.airport_dropoff || applicant.rates.addons.shuttle || applicant.rates.addons.backline || applicant.rates.addons.accommodation)" class="comp-addon-badges">
                    <span v-if="applicant.rates.addons.tent" class="addon-badge">Tent</span>
                    <span v-if="applicant.rates.addons.sleeping_bag" class="addon-badge">Sleeping Bag</span>
                    <span v-if="applicant.rates.addons.airport_pickup" class="addon-badge">Airport Pickup</span>
                    <span v-if="applicant.rates.addons.airport_dropoff" class="addon-badge">Airport Dropoff</span>
                    <span v-if="applicant.rates.addons.shuttle" class="addon-badge">Shuttle</span>
                    <span v-if="applicant.rates.addons.backline" class="addon-badge">Backline</span>
                    <span v-if="applicant.rates.addons.accommodation" class="addon-badge">Accommodation</span>
                  </div>
                  <p v-if="applicant.rates.accommodation_notes" class="comp-current-line">
                    <strong>Accommodation:</strong> {{ applicant.rates.accommodation_notes }}
                  </p>
                  <p v-if="applicant.rates.preferred_payment_method" class="comp-current-line">
                    <strong>Payment:</strong> {{ applicant.rates.preferred_payment_method === 'etransfer' ? 'E-Transfer' : applicant.rates.preferred_payment_method.charAt(0).toUpperCase() + applicant.rates.preferred_payment_method.slice(1) }}
                  </p>
                </template>
                <!-- Current display: legacy string -->
                <template v-else-if="applicant.rates">
                  <p class="comp-current-line"><strong>Fee:</strong> {{ applicant.rates }}</p>
                </template>
              </div>
              <!-- Right: save + clear -->
              <div class="comp-right">
                <img
                  @click="updateCompensation(applicant)"
                  :src="compensation_icon"
                  alt="Update Compensation"
                  class="action-icon"
                  style="width: auto; height: 32px; cursor: pointer"
                />
                <button
                  v-if="applicant.rates"
                  @click="clearCompensation(applicant)"
                  class="comp-clear-btn"
                >Clear</button>
              </div>
            </div>

            <div
              v-if="
                (applicant.applicant_types &&
                  (applicant.applicant_types.includes('Artist') ||
                    applicant.applicant_types.includes('Workshop'))) ||
                applicant.act_name ||
                applicant.workshop_title
              "
              class="settime-section"
            >
              <input type="datetime-local" v-model="applicant.newSettime" />
              <img
                @click="
                  updateSettime(applicant.id_code, applicant.newSettime),
                    (applicant.newSettime = '')
                "
                :src="lineup_icon"
                alt="Add Settime"
                class="action-icon"
                style="width: auto; height: 32px"
              />

              <div v-for="(settime, index) in applicant.settimes || []" :key="index">
                <p
                  class="settime-row"
                  :class="{ 'settime-row--confirm': settimeRemovePending.has(`${applicant.id_code}-${index}`) }"
                  @click="triggerSettimeRemove(applicant.id_code, index)"
                >
                  <span v-if="!settimeRemovePending.has(`${applicant.id_code}-${index}`)">
                    Settime {{ index + 1 }}:
                    {{
                      new Date(settime).toLocaleString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric'
                      })
                    }}
                  </span>
                  <span v-else>Remove settime {{ index + 1 }}?</span>
                </p>
              </div>
            </div>

            <div class="contract-section">
              <button @click="generateContract(applicant.id_code)" class="contract-preview-btn">Preview Contract</button>
              <a
                v-if="applicant.email"
                :href="
                  deliverContract(
                    applicant.email,
                    applicant.fullname,
                    applicant.applicant_types && applicant.applicant_types.length
                      ? applicant.applicant_types.join(', and ')
                      : 'Participant',
                    applicant.id_code
                  )
                "
                target="_blank"
              >
                <img :src="contract_icon" alt="Book Applicant" class="action-icon" style="width:auto;height:32px;" />
              </a>
            </div>

            <!-- Meal Ticket Management -->
            <div class="meal-management-section">
              <h4>Meal Tickets: {{ applicant.meal_tickets_remaining || 0 }}</h4>
              <div class="meal-tickets-control">
                <button
                  @click="decrementMealTickets(applicant.id_code)"
                  :disabled="(applicant.meal_tickets_remaining || 0) <= 0"
                  class="meal-btn decrement-btn"
                >
                  -
                </button>
                <span class="meal-count">{{ applicant.meal_tickets_remaining || 0 }}</span>
                <button
                  @click="incrementMealTickets(applicant.id_code)"
                  class="meal-btn increment-btn"
                >
                  +
                </button>
              </div>
              <!-- Pending ad hoc meal purchases (e-transfer / bitcoin) -->
              <div
                v-if="applicant.pending_meal_purchases && applicant.pending_meal_purchases.filter(p => p.payment_type !== 'cash').length > 0"
                style="margin-top:0.5rem;padding:0.5rem;background:rgba(255,165,0,0.1);border:1px solid orange;border-radius:6px;"
              >
                <strong style="color:orange;font-size:0.8rem;">⏳ Pending Meal Orders</strong>
                <div
                  v-for="(purchase, idx) in applicant.pending_meal_purchases.filter(p => p.payment_type !== 'cash')"
                  :key="idx"
                  style="display:flex;justify-content:space-between;align-items:center;margin-top:0.35rem;font-size:0.8rem;"
                >
                  <span>{{ purchase.meal_quantity }}x — ${{ purchase.fiat_total }} {{ purchase.payment_type }}</span>
                  <button
                    @click="approvePendingMeal(applicant.id_code, purchase)"
                    style="font-size:0.7rem;padding:3px 8px;border-radius:12px;border:none;background:orange;color:black;cursor:pointer;font-weight:bold;"
                  >✓ Approve</button>
                </div>
              </div>
            </div>

            <!-- Decline / Restore -->
            <div v-if="applicant.applicant_types && applicant.applicant_types.length" class="card-decline-section">
              <!-- Already declined -->
              <div v-if="applicant.status === 'declined'" class="declined-badge-row">
                <span class="card-declined-badge">✗ Declined</span>
                <button @click="undeclineApplicantFromCard(applicant.id_code)" class="card-restore-btn">↩ Restore</button>
              </div>

              <!-- Stage 1 -->
              <button
                v-else-if="!declinePendingCards.has(applicant.id_code)"
                @click="toggleDeclinePending(applicant.id_code)"
                class="card-decline-trigger"
              >
                ✗ Decline
              </button>

              <!-- Stage 2 confirm -->
              <div v-else class="card-decline-confirm">
                <p class="card-decline-warning">⚠ This will send a decline email automatically.</p>
                <select
                  :value="declineCardReasons[applicant.id_code] || ''"
                  @change="declineCardReasons[applicant.id_code] = $event.target.value"
                  class="card-decline-select"
                >
                  <option v-for="opt in declineReasons" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <div class="card-decline-btns">
                  <button @click="toggleDeclinePending(applicant.id_code)" class="card-cancel-btn">Cancel</button>
                  <button @click="declineApplicantFromCard(applicant.id_code)" class="card-confirm-decline-btn">Confirm</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, arrayRemove, increment, setDoc, query, where } from 'firebase/firestore'
import { transferTicket } from '@/composables/useTicketTransfer'
import { reunion_db, festivall_db } from '@/firebase'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'
import mixTrack_icon from '@/assets/images/icons/mix_track.png'
import contract_icon from '@/assets/images/icons/contract.png'
import { useRouter } from 'vue-router'
import {
  sendSMS,
  sendEmail,
  sendReunionApplications,
  sendReunionSales,
  sendReunionFood
} from '/scripts/notifications.js'
import sms_icon from '@/assets/images/icons/sms.png'
import compensation_icon from '@/assets/images/icons/compensation.png'
import ticket_icon from '@/assets/images/icons/ticket.png'
import meal_icon from '@/assets/images/icons/meals.png'
import artist_icon from '@/assets/images/icons/artist.png'
import lineup_icon from '@/assets/images/icons/lineup.png'
import reminder_icon from '@/assets/images/icons/reminder.png'
import workshop_icon from '@/assets/images/icons/workshop.png'
import vendor_icon from '@/assets/images/icons/vendor.png'
import volunteer_icon from '@/assets/images/icons/volunteer.png'
import art_installation_icon from '@/assets/images/icons/art_installation.png'
import scavenger_hunt_icon from '@/assets/images/icons/quiz.png'
import task_icon from '@/assets/images/icons/task.png'
import budget_icon from '@/assets/images/icons/budget.png'
import inventory_icon from '@/assets/images/icons/inventory.png'
import map_icon from '@/assets/images/icons/grounds_map.png'
import receipt_icon from '@/assets/images/icons/receipt.png'

export default {
  name: 'DashboardPanel',
  setup() {
    const applicants = ref([])
    const filteredApplicants = ref([])
    const currentCollection = ref('participants_2026')

    const expandedCards = reactive(new Set())
    const toggleCard = (id) => {
      if (expandedCards.has(id)) expandedCards.delete(id)
      else expandedCards.add(id)
    }

    const declinePendingCards = reactive(new Set())
    const declineCardReasons = reactive({})

    const contractRemindPending = reactive(new Set())
    const triggerContractRemind = (id_code) => {
      if (contractRemindPending.has(id_code)) {
        contractRemindPending.delete(id_code)
        remindContract(id_code)
      } else {
        contractRemindPending.add(id_code)
        setTimeout(() => contractRemindPending.delete(id_code), 3000)
      }
    }

    const settimeRemovePending = reactive(new Set())
    const triggerSettimeRemove = (id_code, index) => {
      const key = `${id_code}-${index}`
      if (settimeRemovePending.has(key)) {
        settimeRemovePending.delete(key)
        removeSettime(id_code, index)
      } else {
        settimeRemovePending.add(key)
        setTimeout(() => settimeRemovePending.delete(key), 3000)
      }
    }

    const toggleDeclinePending = (id) => {
      if (declinePendingCards.has(id)) {
        declinePendingCards.delete(id)
        delete declineCardReasons[id]
      } else {
        declinePendingCards.add(id)
      }
    }

    // Add loading and error states
    const loading = ref(false)
    const error = ref(null)

    // Add search functionality
    const searchQuery = ref('')

    // Add pagination
    const pageSize = ref(20)
    const currentPage = ref(1)

    // Add active filters for cumulative filtering
    const activeFilters = ref([])

    // Session cache — avoids repeat Firestore reads within the same page session
    const collectionCache = {}

    const filters = ref([
      // Status filters - distinguish between applicants and customers
      { property: 'status', value: 'applicant', label: 'Applicants' },
      { property: 'status', value: 'declined', label: 'Declined' },
      { property: 'status', value: 'customer', label: 'Customers' },
      { property: 'status', value: 'participant', label: 'Participants' },

      // Application type filters (for applicants)
      { property: 'applicant_types', value: 'Artist', label: 'Artists', collections: ['applications_2025', 'participants_2026'] },
      { property: 'applicant_types', value: 'Volunteer', label: 'Volunteers', collections: ['applications_2025', 'participants_2026'] },
      { property: 'applicant_types', value: 'Workshop', label: 'Workshops', collections: ['applications_2025', 'participants_2026'] },
      { property: 'applicant_types', value: 'Art Installation', label: 'Art Installations', collections: ['applications_2025', 'participants_2026'] },
      { property: 'applicant_types', value: 'Vendor', label: 'Vendors', collections: ['applications_2025', 'participants_2026'] },

      // Act type filters (for artists)
      { property: 'act_type', value: 'DJ', label: 'DJs', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Musician', label: 'Musicians', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Live Band', label: 'Live Bands', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Dancer', label: 'Dancers', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Spoken Word', label: 'Spoken Word', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Singer/Songwriter', label: 'Singer/Songwriter', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_type', value: 'Rapper', label: 'Rappers', collections: ['applications_2025', 'participants_2026'] },

      // Volunteer team filters
      { property: 'volunteer_type', value: 'Setup Crew', label: 'Setup Crew', collections: ['applications_2025', 'participants_2026'] },
      { property: 'volunteer_type', value: 'Cleanup Crew', label: 'Cleanup Crew', collections: ['applications_2025', 'participants_2026'] },
      { property: 'volunteer_type', value: 'Stage Crew', label: 'Stage Crew', collections: ['applications_2025', 'participants_2026'] },
      { property: 'volunteer_type', value: 'Front Gate', label: 'Front Gate', collections: ['applications_2025', 'participants_2026'] },
      { property: 'volunteer_type', value: 'Food Team', label: 'Food Team', collections: ['applications_2025', 'participants_2026'] },
      { property: 'volunteer_type', value: 'Arcade Attendant', label: 'Arcade Attendant', collections: ['participants_2026'] },

      // Application data filters
      { property: 'mix_track_url', value: 'has_value', label: 'Has Mix/Track', collections: ['applications_2025', 'participants_2026'] },
      { property: 'mix_track_url', value: 'no_value', label: 'No Mix/Track', collections: ['applications_2025', 'participants_2026'] },
      { property: 'act_website', value: 'has_value', label: 'Has Website', collections: ['applications_2025', 'participants_2026'] },
      { property: 'workshop_title', value: 'has_value', label: 'Has Workshop', collections: ['applications_2025', 'participants_2026'] },
      { property: 'vendor_type', value: 'has_value', label: 'Has Vendor Info', collections: ['applications_2025', 'participants_2026'] },
      { property: 'installation_title', value: 'has_value', label: 'Has Installation', collections: ['applications_2025', 'participants_2026'] },

      // Contract filters (applies to both applicants and customers)
      { property: 'contract_signed', value: true, label: 'Contract Signed' },
      { property: 'contract_signed', value: false, label: 'Contract Not Signed' },

      // Leads filters (festivall_db leads collection)
      { property: 'source', value: 'reunion', label: 'Source: Reunion', collections: ['leads'] },
      { property: 'source', value: 'impact', label: 'Source: Impact', collections: ['leads'] },
      { property: 'source', value: 'blessed_coast', label: 'Source: Blessed Coast', collections: ['leads'] },
      { property: 'source', value: 'cream_collective', label: 'Source: Cream Collective', collections: ['leads'] },
      { property: 'source', value: 'evolved_music_group', label: 'Source: EMG', collections: ['leads'] },
      { property: 'source', value: 'rapture', label: 'Source: Rapture', collections: ['leads'] },
      { property: 'source', value: 'partywell', label: 'Source: PartyWell', collections: ['leads'] },
      { property: 'applicant_type', value: 'Artist', label: 'Artists', collections: ['leads'] },
      { property: 'applicant_type', value: 'DJ', label: 'DJs', collections: ['leads'] },
      { property: 'applicant_type', value: 'Musician', label: 'Musicians', collections: ['leads'] },
      { property: 'applicant_type', value: 'Volunteer', label: 'Volunteers', collections: ['leads'] },
      { property: 'genre', value: 'has_value', label: 'Has Genre', collections: ['leads'] },
      { property: 'url', value: 'has_value', label: 'Has URL', collections: ['leads'] },
      { property: 'duplicate_email', value: true, label: 'Duplicate Email', collections: ['leads'] },

      // Order/Payment filters (for orders/customers only)
      { property: 'payment_type', value: 'bitcoin', label: 'Bitcoin Payment', collections: ['orders_2025'] },
      { property: 'payment_type', value: 'etransfer', label: 'E-Transfer Payment', collections: ['orders_2025'] },
      { property: 'payment_type', value: 'inkind', label: 'In-Kind Payment', collections: ['orders_2025'] },
      { property: 'paid', value: true, label: 'Paid', collections: ['orders_2025'] },
      { property: 'paid', value: false, label: 'Unpaid', collections: ['orders_2025'] },
      { property: 'checked_in', value: true, label: 'Checked In', collections: ['orders_2025'] },
      { property: 'checked_in', value: false, label: 'Not Checked In', collections: ['orders_2025'] },

    ])

    const relevantFilters = computed(() => {
      if (!applicants.value.length) return []

      return filters.value.filter((filter) => {
        // First check if this filter has collection restrictions
        if (filter.collections) {
          if (!filter.collections.includes(currentCollection.value)) {
            return false
          }
        }

        // Then check if the filter exists in the data
        return applicants.value.some((applicant) => {
          const prop = applicant[filter.property]
          if (filter.value === 'has_value') {
            return prop !== undefined && prop !== '' && prop !== null
          }
          if (filter.value === 'no_value') {
            return prop === undefined || prop === '' || prop === null
          }
          if (filter.value === '') {
            return prop !== undefined && prop !== ''
          }
          if (Array.isArray(prop)) {
            return prop.includes(filter.value) // Check if the array includes the value
          }
          if (typeof prop === 'string' || typeof prop === 'boolean') {
            return prop === filter.value // Check if the value matches (string or boolean)
          }
          return false
        })
      })
    })

    const loadApplicants = async (type, isFirestore = false) => {
      currentCollection.value = type
      activeFilters.value = []
      currentPage.value = 1

      if (collectionCache[type]) {
        applicants.value = collectionCache[type]
        filteredApplicants.value = collectionCache[type]
        return
      }

      loading.value = true
      error.value = null

      try {
        let data = []
        if (isFirestore) {
          // Fetch data from Firestore
          const db = type === 'leads' ? festivall_db : reunion_db
          const applicantsCollection = collection(db, type)
          const applicantsSnapshot = await getDocs(applicantsCollection)
          data = applicantsSnapshot.docs.map((doc) => {
            const docData = doc.data()

            // Normalize data structure for participants_2026 vs orders_2025
            if (type === 'leads') {
              return {
                id: doc.id,
                ...docData,
                fullname: docData.full_name || '',
              }
            } else if (type === 'participants_2026') {
              return {
                id: doc.id,
                id_code: docData.id_code,
                fullname: docData.contact?.fullname || '',
                email: docData.contact?.email || '',
                phone: docData.contact?.phone || '',
                status: docData.status || '',
                // Extract from roles
                applicant_types: docData.roles?.applicant_types || [],
                act_name: docData.roles?.act_name || '',
                act_type: docData.roles?.act_type || '',
                volunteer_type: docData.roles?.volunteer_type || '',
                // Extract from application.data
                genre: docData.application?.data?.genre || '',
                act_description: docData.application?.data?.act_description || '',
                mix_track_url: docData.application?.data?.mix_track_url || '',
                act_website: docData.application?.data?.act_website || '',
                social_url: docData.application?.data?.social_url || '',
                press_kit_url: docData.application?.data?.press_kit_url || '',
                logo_url: docData.application?.data?.logo_url || '',
                volunteer_availability: docData.application?.data?.volunteer_availability || [],
                workshop_title: docData.application?.data?.workshop_title || '',
                workshop_description: docData.application?.data?.workshop_description || '',
                workshop_requirements: docData.application?.data?.workshop_requirements || '',
                vendor_type: docData.application?.data?.vendor_type || '',
                vendor_description: docData.application?.data?.vendor_description || '',
                vendor_requirements: docData.application?.data?.vendor_requirements || '',
                vendor_url: docData.application?.data?.vendor_url || '',
                installation_title: docData.application?.data?.installation_title || '',
                installation_description: docData.application?.data?.installation_description || '',
                space_requirements: docData.application?.data?.space_requirements || '',
                other_requirements: docData.application?.data?.other_requirements || '',
                portfolio_url: docData.application?.data?.portfolio_url || '',
                fixture_type: docData.application?.data?.fixture_type || '',
                rates: docData.application?.data?.rates ?? null,
                statement: docData.application?.data?.statement || '',
                // Contract and order data (if exists)
                contract_signed: docData.contract?.signed || false,
                ticket_type: docData.order?.ticket_type || '',
                ticket_quantity: docData.order?.ticket_quantity || 0,
                original_ticket_quantity: docData.order?.original_ticket_quantity || 0,
                meal_tickets_remaining: docData.order?.meal_tickets_remaining || 0,
                meal_packages: docData.order?.meal_packages || 0,
                pending_meal_purchases: docData.order?.pending_meal_purchases || [],
                total_price: docData.order?.fiat_total_price_cad || 0,
                payment_type: docData.order?.payment_type || '',
                paid: docData.order?.paid || false,
                checked_in: docData.order?.checked_in || false,
                referral_id_code: docData.referral?.referral_id_code || '',
                createdAt: docData.createdAt || '',
                ...docData
              }
            } else {
              return { id: doc.id, ...docData }
            }
          })

          console.log(`Loaded ${data.length} documents from ${type}:`, data)
        } else {
          // Fetch static data from public folder
          const response = await fetch(`/data/applicants/${type}.json`)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          data = await response.json()
        }

        applicants.value = data
          .map((applicant) => ({
            ...applicant,
            message: '',
            isUpdating: false, // Track individual loading states
            comp_amount: '',
            comp_currency: 'CAD',
            comp_non_monetary: '',
            comp_tent: false,
            comp_sleeping_bag: false,
            comp_airport_pickup: false,
            comp_airport_dropoff: false,
            comp_shuttle: false,
            comp_backline: false,
            comp_accommodation: false,
            comp_accommodation_notes: '',
            comp_payment_method: ''
          }))
          .sort((a, b) => {
            if (a.url && !b.url) return -1
            if (!a.url && b.url) return 1
            return 0
          })
        collectionCache[type] = applicants.value
        filteredApplicants.value = applicants.value
      } catch (err) {
        error.value = `Failed to load ${type}: ${err.message}`
        console.error('Load error:', err)
      } finally {
        loading.value = false
      }
    }

    const applyFilter = (property, value) => {
      // Check if this filter is already active
      const filterKey = `${property}-${value}`
      const existingFilterIndex = activeFilters.value.findIndex((f) => f.key === filterKey)

      if (existingFilterIndex >= 0) {
        // Remove the filter if it's already active (toggle off)
        activeFilters.value.splice(existingFilterIndex, 1)
      } else {
        // Add the new filter
        activeFilters.value.push({
          key: filterKey,
          property,
          value,
          filter: (applicant) => {
            const prop = applicant[property]

            // Handle special cases first
            if (value === 'has_value') {
              return prop !== undefined && prop !== '' && prop !== null
            }
            if (value === 'no_value') {
              return prop === undefined || prop === '' || prop === null
            }
            // Handle combined customer filter
            if (value === 'customer_types') {
              return (
                applicant.payment_type &&
                (applicant.payment_type === 'bitcoin' || applicant.payment_type === 'etransfer')
              )
            }

            // Handle arrays
            if (Array.isArray(prop)) {
              return prop.includes(value)
            }

            // Handle exact matches
            if (typeof prop === 'string' || typeof prop === 'boolean') {
              return prop === value
            }

            if (value === '') {
              return prop !== undefined && prop !== ''
            }

            return false
          }
        })
      }

      // Apply all active filters cumulatively
      filteredApplicants.value = applicants.value.filter((applicant) => {
        return activeFilters.value.every((filter) => filter.filter(applicant))
      })

      // Reset pagination when filter changes
      currentPage.value = 1
    }

    const clearFilters = () => {
      activeFilters.value = []
      filteredApplicants.value = applicants.value
      searchQuery.value = '' // Clear search input too
      currentPage.value = 1
    }

    const isFilterActive = (property, value) => {
      const filterKey = `${property}-${value}`
      return activeFilters.value.some((f) => f.key === filterKey)
    }

    const goToApplicantPage = (applicantId) => {
      if (applicantId) {
        router.push({ path: `/dashboard/applicant/${applicantId}` })
      }
    }

    const contractEmailBody = ref('')
    const ticketEmailBody = ref('')
    const transferEmailBody = ref('')
    const showTransferModal = ref(false)
    const isTransferSubmitting = ref(false)
    const transferTargetApplicant = ref(null)
    const transferForm = reactive({ recipientFullname: '', recipientEmail: '', recipientPhone: '', recipientIdCode: '', nTickets: 1 })
    const declineEmailBody = ref('')

    const loadDeclineTemplate = () => {
      fetch('/email_templates/decline_template.txt')
        .then((response) => response.text())
        .then((text) => { declineEmailBody.value = text })
        .catch((err) => { console.error('Error loading decline template:', err) })
    }

    const declineReasons = [
      { value: '', label: '\u2014 No specific reason (optional) \u2014' },
      { value: 'Our festival is still growing and we are not yet in a position to meet your performance fee \u2014 we hope to make it work in a future edition as we continue to expand.', label: 'Budget \u2014 festival still growing' },
      { value: 'Our performance schedule for this year is already fully booked, but we were genuinely impressed by your application and would love to revisit this for a future Reunion.', label: 'Schedule full \u2014 interested next year' },
      { value: 'We already have a number of acts with a similar sound or style this year and want to keep the lineup diverse \u2014 we would strongly encourage you to apply again next year.', label: 'Lineup already filled with similar acts' },
      { value: 'For local artists, we love to see applicants get more involved in the community throughout the year before we bring them onto our stage. Come out to our events, connect with the scene, and we hope to see your application again.', label: 'Local artist \u2014 needs more community involvement' },
      { value: 'We received an exceptional number of applications in your category this year and competition was fierce. A stronger press kit, mix/track, or social presence will help us give your application the full consideration it deserves next year.', label: 'High competition \u2014 strengthen your application' }
    ]

    const declineApplicantFromCard = async (id_code) => {
      const applicant = applicants.value.find((a) => a.id_code === id_code || a.id === id_code)
      if (!applicant) return
      try {
        const docId = applicant.id || id_code
        const docRef = doc(reunion_db, currentCollection.value, docId)
        await updateDoc(docRef, { status: 'declined', updatedAt: new Date().toISOString() })

        const update = (a) =>
          a.id_code === id_code || a.id === id_code ? { ...a, status: 'declined' } : a
        applicants.value = applicants.value.map(update)
        filteredApplicants.value = filteredApplicants.value.map(update)

        if (applicant.email && declineEmailBody.value) {
          const roles = applicant.applicant_types?.join(', and ') || 'applicant'
          const reason = declineCardReasons[id_code] || ''
          const reasonText = reason ? `\n\n${reason}` : ''
          const body = declineEmailBody.value
            .replace('{name}', applicant.fullname || 'there')
            .replace('{roles}', roles)
            .replace('{reason}', reasonText)
          await sendEmail(applicant.email, 'Reunion 2026 \u2014 Application Update', body)
        }

        declinePendingCards.delete(id_code)
        delete declineCardReasons[id_code]
        alert(`${applicant.fullname || id_code} has been declined.`)
      } catch (err) {
        console.error('Error declining applicant:', err)
        alert('Failed to decline applicant.')
      }
    }

    const undeclineApplicantFromCard = async (id_code) => {
      const applicant = applicants.value.find((a) => a.id_code === id_code || a.id === id_code)
      if (!applicant) return
      try {
        const docId = applicant.id || id_code
        const docRef = doc(reunion_db, currentCollection.value, docId)
        await updateDoc(docRef, { status: 'applicant', updatedAt: new Date().toISOString() })
        const update = (a) =>
          a.id_code === id_code || a.id === id_code ? { ...a, status: 'applicant' } : a
        applicants.value = applicants.value.map(update)
        filteredApplicants.value = filteredApplicants.value.map(update)
      } catch (err) {
        console.error('Error restoring applicant:', err)
        alert('Failed to restore applicant.')
      }
    }

    const loadContractDeliveryTemplate = () => {
      fetch('/email_templates/contract_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          contractEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading email template:', error)
        })
    }

    const loadTicketDeliveryTemplate = () => {
      fetch('/email_templates/ticket_delivery_template.txt')
        .then((response) => response.text())
        .then((text) => {
          ticketEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading email template:', error)
        })
    }

    const loadTransferTemplate = () => {
      fetch('/email_templates/ticket_transfer_template.txt')
        .then((response) => response.text())
        .then((text) => {
          transferEmailBody.value = text
        })
        .catch((error) => {
          console.error('Error loading transfer email template:', error)
        })
    }

    const openTransferModal = (applicant) => {
      transferTargetApplicant.value = applicant
      transferForm.recipientFullname = ''
      transferForm.recipientEmail = ''
      transferForm.recipientPhone = ''
      transferForm.recipientIdCode = ''
      transferForm.nTickets = 1
      showTransferModal.value = true
    }

    const submitAdminTransfer = async () => {
      if (isTransferSubmitting.value) return
      const applicant = transferTargetApplicant.value
      if (!applicant) return
      const { recipientFullname, recipientEmail, recipientPhone, recipientIdCode, nTickets } = transferForm
      if (!recipientFullname.trim()) { alert('Please enter the recipient\'s full name.'); return }
      if (!recipientEmail.trim()) { alert('Please enter the recipient\'s email address.'); return }
      if (!recipientPhone.trim()) { alert('Please enter the recipient\'s phone number.'); return }
      if (!nTickets || nTickets < 1) { alert('Please enter at least 1 ticket to transfer.'); return }
      if (nTickets > applicant.ticket_quantity) { alert(`This participant only has ${applicant.ticket_quantity} ticket(s) to transfer.`); return }
      if (!confirm(`Transfer ${nTickets} ticket(s) from ${applicant.contact?.fullname || applicant.id_code} to ${recipientFullname.trim()}?`)) return
      try {
        isTransferSubmitting.value = true
        await transferTicket({
          originalIdCode: applicant.id_code,
          fromName: applicant.contact?.fullname || applicant.id_code,
          recipientFullname,
          recipientEmail,
          recipientPhone,
          recipientIdCode: recipientIdCode?.trim() || '',
          nTickets: Number(nTickets),
          originalOrder: applicant
        })
        // Update local state
        const updated = applicants.value.map((a) => {
          if (a.id_code === applicant.id_code) {
            return { ...a, ticket_quantity: a.ticket_quantity - Number(nTickets) }
          }
          return a
        })
        applicants.value = updated
        filteredApplicants.value = filteredApplicants.value.map((a) => {
          if (a.id_code === applicant.id_code) {
            return { ...a, ticket_quantity: a.ticket_quantity - Number(nTickets) }
          }
          return a
        })
        showTransferModal.value = false
        transferTargetApplicant.value = null
        alert(`Transfer complete! ${recipientFullname.trim()} has been notified by email and SMS.`)
      } catch (err) {
        console.error('Transfer error:', err)
        alert(err.message || 'Transfer failed. Please try again.')
      } finally {
        isTransferSubmitting.value = false
      }
    }

    const router = useRouter()

    const fetchCADEquivalent = async (amount, currency) => {
      try {
        if (currency === 'BTC') {
          const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad')
          const data = await res.json()
          return amount * data.bitcoin.cad
        } else {
          const res = await fetch('https://open.er-api.com/v6/latest/CAD')
          const data = await res.json()
          const rate = data.rates[currency]
          return rate ? amount / rate : null
        }
      } catch {
        return null
      }
    }

    const updateCompensation = async (applicant) => {
      const rawAmount = applicant.comp_amount
      const amount = rawAmount !== '' && rawAmount !== null && rawAmount !== undefined
        ? parseFloat(rawAmount) : null
      const currency = applicant.comp_currency || 'CAD'
      const non_monetary = (applicant.comp_non_monetary || '').trim() || null
      const addons = {
        tent: !!applicant.comp_tent,
        sleeping_bag: !!applicant.comp_sleeping_bag,
        airport_pickup: !!applicant.comp_airport_pickup,
        airport_dropoff: !!applicant.comp_airport_dropoff,
        shuttle: !!applicant.comp_shuttle,
        backline: !!applicant.comp_backline,
        accommodation: !!applicant.comp_accommodation
      }
      const hasMonetary = amount !== null && !isNaN(amount)
      const hasAddons = Object.values(addons).some(Boolean)

      if (!hasMonetary && !non_monetary && !hasAddons) {
        alert('Please fill in at least one compensation field before saving.')
        return
      }
      if (hasMonetary && amount <= 0) {
        alert('Monetary amount must be greater than zero.')
        return
      }
      if (hasMonetary && currency === 'BTC' && amount > 0.1) {
        if (!confirm(`\u26a0\ufe0f ${amount} BTC is a very large amount. Are you sure?`)) return
      }

      let warnPrefix = ''
      let cadHint = ''
      if (hasMonetary) {
        if (currency !== 'CAD') {
          const cad = await fetchCADEquivalent(amount, currency)
          if (cad !== null) {
            cadHint = ` (\u2248 $${cad.toLocaleString('en-CA', { maximumFractionDigits: 0 })} CAD)`
            if (cad >= 5000) warnPrefix = `\u26a0\ufe0f WARNING: \u2248 $${cad.toFixed(0)} CAD equivalent.\n\n`
          }
        } else if (amount >= 5000) {
          warnPrefix = `\u26a0\ufe0f WARNING: $${amount} CAD is a large amount.\n\n`
        }
      }

      const parts = []
      if (hasMonetary) parts.push(`Fee: ${amount} ${currency}${cadHint}`)
      if (non_monetary) parts.push(`Non-monetary: ${non_monetary}`)
      if (hasAddons) parts.push(`Add-ons: ${Object.entries(addons).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ')}`)
      if (!confirm(`${warnPrefix}Save compensation?\n\n${parts.join('\n')}`)) return

      const ratesObj = {
        monetary_amount: hasMonetary ? amount : null,
        monetary_currency: hasMonetary ? currency : null,
        non_monetary,
        preferred_payment_method: applicant.comp_payment_method || null,
        accommodation_notes: applicant.comp_accommodation && applicant.comp_accommodation_notes ? applicant.comp_accommodation_notes.trim() : null,
        addons
      }

      const resetComp = { comp_amount: '', comp_currency: 'CAD', comp_non_monetary: '', comp_tent: false, comp_sleeping_bag: false, comp_airport_pickup: false, comp_airport_dropoff: false, comp_shuttle: false, comp_backline: false, comp_accommodation: false, comp_accommodation_notes: '', comp_payment_method: '' }
      try {
        const docRef = doc(reunion_db, currentCollection.value, applicant.id)
        await updateDoc(docRef, { 'application.data.rates': ratesObj })
        const update = (a) => a.id === applicant.id ? { ...a, rates: ratesObj, ...resetComp } : a
        applicants.value = applicants.value.map(update)
        filteredApplicants.value = filteredApplicants.value.map(update)
      } catch (error) {
        console.error('Error updating compensation:', error)
      }
    }

    const clearCompensation = async (applicant) => {
      const resetComp = { comp_amount: '', comp_currency: 'CAD', comp_non_monetary: '', comp_tent: false, comp_sleeping_bag: false, comp_airport_pickup: false, comp_airport_dropoff: false, comp_shuttle: false, comp_backline: false, comp_accommodation: false, comp_accommodation_notes: '', comp_payment_method: '' }
      try {
        const docRef = doc(reunion_db, currentCollection.value, applicant.id)
        await updateDoc(docRef, { 'application.data.rates': null })
        const update = (a) => a.id === applicant.id ? { ...a, rates: null, ...resetComp } : a
        applicants.value = applicants.value.map(update)
        filteredApplicants.value = filteredApplicants.value.map(update)
      } catch (error) {
        console.error('Error clearing compensation:', error)
      }
    }

    const updateSettime = async (id_code, newSettime) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)

        // Fetch the current document to get the existing set times
        const docSnap = await getDoc(docRef)
        const existingSettimes = docSnap.exists() ? docSnap.data().settimes || [] : []

        // Add the new set time to the array
        const updatedSettimes = [...existingSettimes, newSettime]

        // Update the document with the new array of set times
        await updateDoc(docRef, {
          settimes: updatedSettimes
        })

        // Update both applicants and filteredApplicants arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code) {
            return {
              ...applicant,
              settimes: updatedSettimes,
              newSettime: '' // Clear the input field
            }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)
      } catch (error) {
        console.error('Error updating settime:', error)
      }
    }

    const removeSettime = async (id_code, index) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)

        // Fetch the current document to get the existing set times
        const docSnap = await getDoc(docRef)
        const existingSettimes = docSnap.exists() ? docSnap.data().settimes || [] : []

        // Remove the set time at the specified index
        const updatedSettimes = existingSettimes.filter((_, i) => i !== index)

        // Update the document with the new array of set times
        await updateDoc(docRef, {
          settimes: updatedSettimes
        })

        // Update both applicants and filteredApplicants arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code) {
            return {
              ...applicant,
              settimes: updatedSettimes
            }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)
      } catch (error) {
        console.error('Error removing settime:', error)
      }
    }

    const generateLineup = () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festivall//Lineup//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Reunion Artist Lineup',
        'X-WR-TIMEZONE:America/Regina',
        'X-WR-CALDESC:Lineup for Reunion 2025',
        ...filteredApplicants.value
          .filter((applicant) => applicant.settime)
          .map((applicant) => {
            const startTime =
              new Date(applicant.settime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
            const endTime =
              new Date(new Date(applicant.settime).getTime() + 3600000)
                .toISOString()
                .replace(/[-:]/g, '')
                .split('.')[0] + 'Z' // Adds 1 hour to the start time

            return [
              'BEGIN:VEVENT',
              `UID:${applicant.id_code_long || applicant.email || Math.random().toString(36).substring(2)}`,
              `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
              `DTSTART:${startTime}`,
              `DTEND:${endTime}`,
              `SUMMARY:${applicant.act_name || applicant.workshop_title || applicant.full_name}`,
              `DESCRIPTION:${applicant.mix_track_url || ''}`,
              `LOCATION:https://festivall.ca/reunionlocation`,
              'STATUS:CONFIRMED',
              'SEQUENCE:0',
              'TRANSP:OPAQUE',
              applicant.email
                ? `ATTENDEE;CN=${applicant.full_name || applicant.act_name || 'Guest'};RSVP=TRUE:mailto:${applicant.email}`
                : '',
              `X-APPLICANT-ID:${applicant.id_code || ''}`,
              `X-APPLICANT-NAME:${applicant.full_name || applicant.act_name || ''}`,
              `X-APPLICANT-EMAIL:${applicant.email || ''}`,
              `X-APPLICANT-TYPE:${applicant.applicant_type || ''}`,
              `X-APPLICANT-ACTNAME:${applicant.act_name || ''}`,
              `X-APPLICANT-ACTDESCRIPTION:${applicant.act_description || ''}`,
              `X-APPLICANT-MIXTRACKURL:${applicant.mix_track_url || ''}`,
              `X-APPLICANT-WORKSHOPTITLE:${applicant.workshop_title || ''}`,
              `X-APPLICANT-WORKSHOPDESCRIPTION:${applicant.workshop_description || ''}`,

              'END:VEVENT'
            ]
              .filter(Boolean)
              .join('\n') // Filters out empty lines
          }),
        'END:VCALENDAR'
      ].join('\n')

      const blob = new Blob([icsContent], { type: 'text/calendar' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'lineup.ics'
      link.click()
      URL.revokeObjectURL(url)
    }

    const exportPosterText = () => {
      const actNames = searchedApplicants.value
        .map((a) => a.act_name)
        .filter(Boolean)

      const workshopTitles = searchedApplicants.value
        .map((a) => a.workshop_title)
        .filter(Boolean)

      const amenityLabels = [
        'In house ticketing system',
        'Self check-in kiosk',
        'Customizable schedule',
        'Detailed interactivegrounds map',
        'Text notifications',
        'Custom sound system',
        'FM radio broadcast',
        'Projection mapped visuals',
        'Self-serve meal kiosk',
        'Shared kitchen available',
        'Potable water on site',
        'Bitcoin and Lightning accepted',
        'Scavenger hunt',
        'Interactive photo booth',
        'Live workshops',
        'Art installations',
        'Retro video game arcade',
        'Nerf gun battle arena',
        'Campsite parking',
        'Warm showers available',
        'Wading pool to cool off',
        "Children's playground",
        'Quiet family camping area',
        'Leave pets at home',
      ]

      if (actNames.length === 0 && workshopTitles.length === 0) {
        alert('No act names or workshop titles in current view.')
        return
      }

      const dot = ' \u00B7'
      const { weekendPass, dayPass, mealPackage } = REUNION_FESTIVAL.pricing
      const pricingLabels = [
        `Weekend Pass $${weekendPass}` + dot,
        `Day Pass $${dayPass}` + dot,
        `Meal Package $${mealPackage}` + dot,
        'Last Minute Gate Fee Applies' + dot,
        'Children 12 & Under Free' + dot,
      ]
      const actLine = actNames.map((n) => n + dot).join(' ')
      const workshopLine = workshopTitles.map((n) => n + dot).join(' ')
      const amenityLine = amenityLabels.map((n) => n + dot).join(' ')
      const pricingLine = pricingLabels.join(' ')

      const parts = [actLine, workshopLine, amenityLine, pricingLine].filter(Boolean)
      const content = parts.join('\n')
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `poster_text_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      URL.revokeObjectURL(url)
    }

    const exportContactsCSV = () => {
      const csvContent = [
        ...searchedApplicants.value
          .filter((applicant) => applicant.fullname || applicant.phone)
          .map((applicant) => {
            const firstName = (applicant.fullname || '').split(' ')[0] || ''
            const phone = applicant.phone || ''
            return `${firstName},${phone}`
          })
      ].join('\n')

      const filterNames = activeFilters.value
        .map((filter) => {
          const filterDef = filters.value.find(
            (f) => f.property === filter.property && f.value === filter.value
          )
          return filterDef ? filterDef.label.replace(/\s+/g, '_').toLowerCase() : ''
        })
        .filter(Boolean)

      const baseFilename = filterNames.length > 0 ? filterNames.join('_') : 'all_contacts'
      const filename = `${baseFilename}_contacts_${new Date().toISOString().split('T')[0]}.csv`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }

    const exportEmailsCSV = () => {
      const csvContent = [
        ...searchedApplicants.value
          .filter((applicant) => applicant.email)
          .map((applicant) => `"${applicant.fullname || ''}",${applicant.email}`)
      ].join('\n')

      const filterNames = activeFilters.value
        .map((filter) => {
          const filterDef = filters.value.find(
            (f) => f.property === filter.property && f.value === filter.value
          )
          return filterDef ? filterDef.label.replace(/\s+/g, '_').toLowerCase() : ''
        })
        .filter(Boolean)

      const baseFilename = filterNames.length > 0 ? filterNames.join('_') : 'all_emails'
      const filename = `${baseFilename}_emails_${new Date().toISOString().split('T')[0]}.csv`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }

    const generateContract = (id_code) => {
      router.push({ path: `/reunioncontract/${id_code}` })
    }

    const remindContract = (id_code) => {
      const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)
      if (applicant && applicant.phone) {
        const message = `Hello ${applicant.fullname || 'there'}. This is a gentle reminder to sign your contract for Reunion 2025, if you haven't already.`
        sendSMS(applicant.phone, message)
        alert('Contract reminder sent successfully.')
      } else {
        alert('Phone number not available for this applicant.')
      }
    }

    const remindPayment = (id_code) => {
      const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)
      if (applicant && applicant.phone) {
        const message = `Hello ${applicant.fullname || 'there'}. This is a gentle reminder to make your payment for Reunion 2025, if you haven't already.`
        sendSMS(applicant.phone, message)
        alert('Payment reminder sent successfully.')
      } else {
        alert('Phone number not available for this applicant.')
      }
    }

    const deliverContract = (email, fullname, roles, id_code) => {
      const subject = encodeURIComponent('Reunion 2026')
      const personalizedBody = contractEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{roles}', roles || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
    }

    const confirmPaymentReceived = async (id_code) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)
        await updateDoc(docRef, { 'order.paid': true })

        // Find the applicant for the notification
        const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)

        // Update both applicants and filteredApplicants arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code) {
            return {
              ...applicant,
              paid: true
            }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)

        // Send notification only once, after both arrays are updated
        if (applicant) {
          sendReunionSales(
            `:bust_in_silhouette: Payment confirmed for ${applicant.fullname}.\n:ticket: ${applicant.id_code}`
          )
        }

        alert('Payment status updated successfully.')
      } catch (error) {
        console.error('Error updating paid status:', error)
      }
    }

    const revokeTicket = async (id_code) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)
        await updateDoc(docRef, { 'order.paid': false })

        // Find the applicant for the notification
        const applicant = applicants.value.find((applicant) => applicant.id_code === id_code)

        // Update both applicants and filteredApplicants arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code) {
            return {
              ...applicant,
              paid: false
            }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)

        // Send notification only once, after both arrays are updated
        if (applicant) {
          sendReunionApplications(
            `:warning: Ticket revoked for ${applicant.fullname}.\n:ticket: ${applicant.id_code}`
          )
        }

        alert('Ticket revoked successfully.')
      } catch (error) {
        console.error('Error updating paid status:', error)
      }
    }

    const previewTicket = (id_code) => {
      router.push({ path: `/reunionticket/${id_code}` })
    }

    const deliverTicket = (email, fullname, id_code) => {
      const subject = encodeURIComponent('Reunion 2026')
      const personalizedBody = ticketEmailBody.value
        .replace('{name}', fullname || '')
        .replace('{id_code}', id_code || '')
      const body = encodeURIComponent(personalizedBody)
      return `mailto:${email}?subject=${subject}&body=${body}&cc=prasun.das.89@gmail.com`
    }

    // Add search functionality
    const searchedApplicants = computed(() => {
      if (!filteredApplicants.value || !Array.isArray(filteredApplicants.value)) return []
      if (!searchQuery.value) return filteredApplicants.value

      const query = searchQuery.value.toLowerCase()
      return filteredApplicants.value.filter(
        (applicant) =>
          applicant.fullname?.toLowerCase().includes(query) ||
          applicant.act_name?.toLowerCase().includes(query) ||
          applicant.email?.toLowerCase().includes(query) ||
          applicant.id_code?.toLowerCase().includes(query)
      )
    })

    // Add pagination
    const paginatedApplicants = computed(() => {
      if (!searchedApplicants.value || !Array.isArray(searchedApplicants.value)) return []
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return searchedApplicants.value.slice(start, end)
    })

    const totalPages = computed(() => {
      if (!searchedApplicants.value || !Array.isArray(searchedApplicants.value)) return 1
      return Math.ceil(searchedApplicants.value.length / pageSize.value)
    })

    onMounted(() => {
      loadApplicants('participants_2026', true)
      loadContractDeliveryTemplate()
      loadTicketDeliveryTemplate()
      loadTransferTemplate()
      loadDeclineTemplate()
    })

    const exportMealRedemptionData = async () => {
      try {
        // Use all loaded data from orders_2025 collection
        const orders = applicants.value

        if (orders.length === 0) {
          alert('No order data loaded. Please load Reunion Orders 2025 first.')
          return
        }

        // Collect all redemption data AND current meal ticket status
        const allRedemptions = []
        const currentMealStatus = []

        orders.forEach((order) => {
          // Add redemption history if it exists
          if (order.meal_redemption_history && order.meal_redemption_history.length > 0) {
            order.meal_redemption_history.forEach((redemption) => {
              allRedemptions.push({
                idCode: order.id_code,
                fullName: order.fullname,
                ticketType: order.ticket_type || 'N/A',
                timestamp: redemption.timestamp,
                festival_day: redemption.festival_day,
                tickets_redeemed: redemption.tickets_redeemed,
                remaining_after: redemption.remaining_after,
                redeemed_by: redemption.redeemed_by,
                reason: redemption.reason || 'Normal redemption',
                date: new Date(redemption.timestamp).toLocaleDateString(),
                time: new Date(redemption.timestamp).toLocaleTimeString(),
                recordType: 'redemption'
              })
            })
          }

          // Add current meal ticket status for everyone
          if (order.meal_tickets_remaining !== undefined || order.last_meal_redemption) {
            currentMealStatus.push({
              idCode: order.id_code,
              fullName: order.fullname,
              ticketType: order.ticket_type || 'N/A',
              currentMealTickets: order.meal_tickets_remaining || 0,
              lastRedemption: order.last_meal_redemption || 'Never',
              totalRedemptions: order.meal_redemption_history
                ? order.meal_redemption_history.length
                : 0,
              recordType: 'current_status'
            })
          }
        })

        // Combine both datasets
        const allData = [...allRedemptions, ...currentMealStatus]

        // Sort by record type (current status first) then by name
        allData.sort((a, b) => {
          if (a.recordType !== b.recordType) {
            return a.recordType === 'current_status' ? -1 : 1
          }
          return (a.fullName || '').localeCompare(b.fullName || '')
        })

        // Convert to CSV
        if (allData.length === 0) {
          alert('No meal ticket data found in the loaded orders.')
          return
        }

        // Create different headers based on data type
        const headers = [
          'Record Type',
          'Applicant ID',
          'Full Name',
          'Ticket Type',
          'Current Meal Tickets',
          'Total Redemptions',
          'Last Redemption',
          'Date',
          'Time',
          'Festival Day',
          'Tickets Redeemed',
          'Remaining After',
          'Redeemed By',
          'Reason'
        ]

        const csvContent = [
          headers.join(','),
          ...allData.map((r) =>
            [
              r.recordType,
              r.idCode || '',
              `"${r.fullName || ''}"`,
              `"${r.ticketType || ''}"`,
              r.currentMealTickets !== undefined ? r.currentMealTickets : r.remaining_after || '',
              r.totalRedemptions !== undefined ? r.totalRedemptions : '',
              r.lastRedemption !== undefined
                ? r.lastRedemption === 'Never'
                  ? 'Never'
                  : new Date(r.lastRedemption).toLocaleString()
                : '',
              r.date || '',
              r.time || '',
              r.festival_day || '',
              r.tickets_redeemed || '',
              r.remaining_after || '',
              r.redeemed_by || '',
              `"${r.reason || ''}"`
            ].join(',')
          )
        ].join('\n')

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meal_redemption_data_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        alert(
          `Exported ${currentMealStatus.length} current meal statuses and ${allRedemptions.length} redemption records to CSV file.`
        )
      } catch (error) {
        console.error('Error exporting meal redemption data:', error)
        alert('Failed to export data. Please try again.')
      }
    }

    const exportEntranceActivityData = async () => {
      try {
        // Use all loaded data from orders_2025 collection
        const orders = applicants.value

        if (orders.length === 0) {
          alert('No order data loaded. Please load Reunion Orders 2025 first.')
          return
        }

        // Collect all entrance activity data AND current entrance status
        const allActivity = []
        const currentEntranceStatus = []

        orders.forEach((order) => {
          // Add entrance activity history if it exists
          if (order.entrance_activity_history && order.entrance_activity_history.length > 0) {
            order.entrance_activity_history.forEach((activity) => {
              allActivity.push({
                idCode: order.id_code,
                fullName: order.fullname,
                ticketType: order.ticket_type || 'N/A',
                timestamp: activity.timestamp,
                festival_day: activity.festival_day,
                action: activity.action,
                ticket_quantity_after: activity.ticket_quantity_after,
                operator: activity.operator,
                operator_name: activity.operator_name || activity.operator,
                date: new Date(activity.timestamp).toLocaleDateString(),
                time: new Date(activity.timestamp).toLocaleTimeString(),
                recordType: 'activity'
              })
            })
          }

          // Add current entrance status for everyone
          currentEntranceStatus.push({
            idCode: order.id_code,
            fullName: order.fullname,
            ticketType: order.ticket_type || 'N/A',
            currentTicketQuantity: order.ticket_quantity || 0,
            originalTicketQuantity: order.original_ticket_quantity || order.ticket_quantity || 0,
            checkedIn: order.checked_in || false,
            lastActivity: order.last_entrance_activity || 'No activity',
            totalActivities: order.entrance_activity_history
              ? order.entrance_activity_history.length
              : 0,
            recordType: 'current_status'
          })
        })

        // Combine both datasets
        const allData = [...allActivity, ...currentEntranceStatus]

        // Sort by record type (current status first) then by name
        allData.sort((a, b) => {
          if (a.recordType !== b.recordType) {
            return a.recordType === 'current_status' ? -1 : 1
          }
          return (a.fullName || '').localeCompare(b.fullName || '')
        })

        // Convert to CSV
        if (allData.length === 0) {
          alert('No entrance activity data found in the loaded orders.')
          return
        }

        // Create headers for entrance activity data
        const headers = [
          'Record Type',
          'Applicant ID',
          'Full Name',
          'Ticket Type',
          'Current Tickets',
          'Original Tickets',
          'Checked In',
          'Total Activities',
          'Last Activity',
          'Date',
          'Time',
          'Festival Day',
          'Action',
          'Tickets After',
          'Operator ID',
          'Operator Name'
        ]

        const csvContent = [
          headers.join(','),
          ...allData.map((r) =>
            [
              r.recordType,
              r.idCode || '',
              `"${r.fullName || ''}"`,
              `"${r.ticketType || ''}"`,
              r.currentTicketQuantity !== undefined
                ? r.currentTicketQuantity
                : r.ticket_quantity_after || '',
              r.originalTicketQuantity || '',
              r.checkedIn !== undefined ? (r.checkedIn ? 'Yes' : 'No') : '',
              r.totalActivities !== undefined ? r.totalActivities : '',
              r.lastActivity !== undefined
                ? r.lastActivity === 'No activity'
                  ? 'No activity'
                  : new Date(r.lastActivity).toLocaleString()
                : '',
              r.date || '',
              r.time || '',
              r.festival_day || '',
              r.action || '',
              r.ticket_quantity_after || '',
              r.operator || '',
              `"${r.operator_name || ''}"`
            ].join(',')
          )
        ].join('\n')

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `entrance_activity_data_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        alert(
          `Exported ${currentEntranceStatus.length} current entrance statuses and ${allActivity.length} activity records to CSV file.`
        )
      } catch (error) {
        console.error('Error exporting entrance activity data:', error)
        alert('Failed to export data. Please try again.')
      }
    }

    const approvePendingMeal = async (id_code, purchase) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)
        const now = new Date().toISOString()
        const approvedEntry = { ...purchase, status: 'paid', approved_by: 'admin', approved_at: now }
        await updateDoc(docRef, {
          'order.meal_tickets_remaining': increment(Number(purchase.meal_quantity)),
          'order.pending_meal_purchases': arrayRemove(purchase),
          'order.ad_hoc_meal_orders': arrayUnion(approvedEntry)
        })
        const updateApplicant = (a) => {
          if (a.id_code === id_code || a.id === id_code) {
            return {
              ...a,
              meal_tickets_remaining: (a.meal_tickets_remaining || 0) + Number(purchase.meal_quantity),
              pending_meal_purchases: (a.pending_meal_purchases || []).filter(p =>
                !(p.timestamp === purchase.timestamp && p.meal_quantity === purchase.meal_quantity && p.payment_type === purchase.payment_type)
              )
            }
          }
          return a
        }
        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)
        sendReunionFood(`:fork_and_knife: MEAL ORDER APPROVED\n:id: ${id_code}\n:knife_fork_plate: +${purchase.meal_quantity} ticket(s)\n:credit_card: ${purchase.payment_type}\n:moneybag: $${purchase.fiat_total}`)
      } catch (error) {
        console.error('Error approving pending meal:', error)
        alert('Failed to approve. Please try again.')
      }
    }

    const incrementMealTickets = async (id_code) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)
        const applicant = applicants.value.find((a) => a.id_code === id_code || a.id === id_code)
        const currentTickets = (applicant?.meal_tickets_remaining || 0) + 1

        await updateDoc(docRef, { 'order.meal_tickets_remaining': currentTickets })

        // Update both arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code || applicant.id === id_code) {
            return { ...applicant, meal_tickets_remaining: currentTickets }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)
      } catch (error) {
        console.error('Error incrementing meal tickets:', error)
      }
    }

    const decrementMealTickets = async (id_code) => {
      try {
        const docRef = doc(reunion_db, currentCollection.value, id_code)
        const applicant = applicants.value.find((a) => a.id_code === id_code || a.id === id_code)
        const currentTickets = Math.max(0, (applicant?.meal_tickets_remaining || 0) - 1)

        await updateDoc(docRef, { 'order.meal_tickets_remaining': currentTickets })

        // Update both arrays
        const updateApplicant = (applicant) => {
          if (applicant.id_code === id_code || applicant.id === id_code) {
            return { ...applicant, meal_tickets_remaining: currentTickets }
          }
          return applicant
        }

        applicants.value = applicants.value.map(updateApplicant)
        filteredApplicants.value = filteredApplicants.value.map(updateApplicant)
      } catch (error) {
        console.error('Error decrementing meal tickets:', error)
      }
    }

    return {
      applicants,
      filteredApplicants,
      currentCollection,
      relevantFilters,
      activeFilters,
      loadApplicants,
      applyFilter,
      clearFilters,
      isFilterActive,
      goToApplicantPage,
      deliverContract,
      deliverTicket,
      sendSMS,
      sms_icon,
      ticket_icon,
      meal_icon,
      artist_icon,
      volunteer_icon,
      workshop_icon,
      vendor_icon,
      art_installation_icon,
      scavenger_hunt_icon,
      task_icon,
      budget_icon,
      inventory_icon,
      map_icon,
      receipt_icon,
      sendEmail,
      compensation_icon,
      updateCompensation,
      clearCompensation,
      lineup_icon,
      updateSettime,
      removeSettime,
      generateLineup,
      exportContactsCSV,
      exportEmailsCSV,
      exportPosterText,
      generateContract,
      remindContract,
      contractRemindPending,
      triggerContractRemind,
      settimeRemovePending,
      triggerSettimeRemove,
      remindPayment,
      confirmPaymentReceived,
      revokeTicket,
      openTransferModal,
      submitAdminTransfer,
      showTransferModal,
      isTransferSubmitting,
      transferTargetApplicant,
      transferForm,
      transferEmailBody,
      previewTicket,
      mixTrack_icon,
      contract_icon,
      reminder_icon,
      contractEmailBody,
      ticketEmailBody,
      loading,
      error,
      searchQuery,
      searchedApplicants,
      pageSize,
      currentPage,
      totalPages,
      paginatedApplicants,
      exportMealRedemptionData,
      exportEntranceActivityData,
      incrementMealTickets,
      decrementMealTickets,
      approvePendingMeal,
      expandedCards,
      toggleCard,
      declinePendingCards,
      declineCardReasons,
      declineReasons,
      toggleDeclinePending,
      declineApplicantFromCard,
      undeclineApplicantFromCard
    }
  }
}
</script>

<style scoped>
img {
  margin: 0.5rem;
}
.dashboard {
  width: 100vw;
  padding: 0.5rem;
  background-color: #1f1e22;
  color: #f0f4f8;
  text-align: center;
}

.banner {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 1rem;
  border-radius: 10px;
}

.logo {
  height: auto;
  width: 100px;
}

h1 {
  color: var(--festivall-baby-blue);
}

.controls,
.filters {
  margin-bottom: 0.5rem;
}

.buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 5px;
  background-color: var(--festivall-baby-blue);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button.active-filter {
  background-color: #ff6b35;
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
  border: 2px solid #ff8c5a;
}

button.active-filter:hover {
  background-color: #e55a2b;
}

.view-toggle label {
  margin: 0 1rem;
  cursor: pointer;
}

.dashboard-panel {
  background-color: #333;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.applicants {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.applicant {
  background-color: #444;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.9);
  transition: transform 0.3s ease;
  width: 100%;
  position: relative;
  border: 1px solid var(--festivall-baby-blue);
  overflow: visible;
}

@media (min-width: 769px) {
  .applicant {
    max-height: 500px;
    overflow-y: auto;
  }

  .applicant-content {
    gap: 0.35rem;
  }

  .preview-section,
  .ticket-section,
  .message-section,
  .settime-section,
  .contract-section,
  .checkedin-section,
  .revenue-section,
  .quantities-section {
    margin-top: 0.35rem;
    padding: 0.35rem;
    gap: 0.35rem;
  }
}

.detail-link-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  background-color: var(--festivall-baby-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  font-size: 16px;
}

.detail-link-icon:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}

/* ── Contract status chip (top-left of card) ──────────────────────────────── */
.contract-chip {
  position: absolute;
  top: 0.45rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 10;
  pointer-events: none;
}

.contract-chip-signed,
.contract-chip-unsigned {
  font-size: 0.62rem;
  font-weight: 600;
  padding: 0.12rem 0.4rem;
  border-radius: 99px;
  pointer-events: none;
}

.contract-chip-signed {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid rgba(76, 175, 80, 0.35);
}

.contract-chip-unsigned {
  font-size: 0.62rem;
  font-weight: 600;
  padding: 0.12rem 0.4rem;
  border-radius: 99px;
  cursor: pointer;
  color: #ef5350;
  background: rgba(239, 83, 80, 0.12);
  border: 1px solid rgba(239, 83, 80, 0.35);
  pointer-events: all;
  transition: background 0.2s, color 0.2s;
}

.contract-chip-unsigned:hover {
  background: rgba(239, 83, 80, 0.25);
}

.contract-chip-confirm {
  color: #fff;
  background: #c0392b;
  border-color: #c0392b;
}

.preview-section,
.ticket-section,
.message-section,
.settime-section,
.contract-section {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--festivall-baby-blue);
  width: 100%;
  align-items: center;
}
.checkedin-section,
.revenue-section,
.quantities-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  /* background-color: #444; */
  border: 1px solid var(--festivall-baby-blue);
  width: 100%;
  align-items: center;
}

/* Card header — hidden on desktop, shown on mobile */
.card-header {
  display: none;
}

.applicant:hover {
  transform: scale(1.01);
}

.applicant-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.id_code {
  color: var(--festivall-baby-blue);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.actions img {
  margin: 0;
}

.message-section {
  grid-template-columns: 3fr 1fr;
  align-items: center;
}

.message-section input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin: 0;
}

.message-section .action-icon {
  justify-self: center;
  align-self: center;
  margin: 0;
}


.settime-section > div {
  grid-column: 1 / -1;
}

.settime-section p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.settime-section input {
  width: clamp(150px, 85%, 280px);
  min-width: 0;
  justify-self: start;
}

.settime-section .action-icon {
  display: flex;
  justify-self: center;
  align-self: center;
  margin: 0 auto;
}

.settime-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  user-select: none;
}

.settime-row:hover {
  border-color: rgba(192, 57, 43, 0.4);
  background: rgba(192, 57, 43, 0.07);
}

.settime-row--confirm {
  border-color: #c0392b !important;
  background: #c0392b !important;
  color: white !important;
  font-weight: 600;
}

/* contract-status-* kept for back-compat but status-row/badge are canonical now */

/* ── Shared section action button (blue outline, fills left cell) ─────────── */
.section-action-btn,
.contract-preview-btn {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  background: transparent;
  color: var(--festivall-baby-blue);
  border: 1px solid var(--festivall-baby-blue);
  cursor: pointer;
  width: 100%;
}

.section-action-btn:hover,
.contract-preview-btn:hover {
  background: var(--festivall-baby-blue);
  color: white;
}

/* ── Payment section ──────────────────────────────────────────────────────── */
.payment-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
  padding: 0.35rem;
  border-radius: 10px;
  border: 1px solid var(--festivall-baby-blue);
}

/* ── Shared status row (payment, contract, etc.) ──────────────────────────── */
.status-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.status-label {
  color: #aaa;
}

.status-badge {
  font-weight: 600;
  font-size: 0.8rem;
}

.status-ok  { color: #4caf50; }
.status-bad { color: #ef5350; }

/* ── Card action row (button groups inside sections) ──────────────────────── */
.card-action-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.card-btn-primary,
.card-btn-danger,
.card-btn-success {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
}

.card-btn-primary {
  border: 1px solid var(--festivall-baby-blue);
  color: var(--festivall-baby-blue);
}
.card-btn-primary:hover { background: var(--festivall-baby-blue); color: white; }

.card-btn-danger {
  border: 1px solid #c0392b;
  color: #e74c3c;
}
.card-btn-danger:hover { background: #c0392b; color: white; }

.card-btn-success {
  border: 1px solid #388e3c;
  color: #4caf50;
}
.card-btn-success:hover { background: #388e3c; color: white; }

input [type='datetime-local'],
input {
  padding: 0.4rem;
  border-radius: 6px;
  border: 1px solid var(--festivall-baby-blue);
  background: #1a1a1d;
  color: white;
}

h2 {
  margin: 0;
  padding: 0;
  color: var(--festivall-baby-blue);
}

p {
  margin: 0;
  color: #f0f4f8;
}

a {
  display: inline-block;
  color: var(--festivall-baby-blue);
  text-decoration: none;
  border-radius: 6px;
}

.action-icon {
  width: 42px;
  height: auto;
  cursor: pointer;
  margin: 3px;
}

.section-icon {
  width: 36px;
  margin: auto;
}

.scanner-links {
  display: flex;

  gap: 1rem;
}
.scanner-link {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: var(--festivall-baby-blue);
  background-color: #444;
  padding: 0.5rem;
  border-radius: 10px;
}

/* Add loading and error states */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  font-size: 1.2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #333;
  border-top: 4px solid var(--festivall-baby-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: #ff4444;
  color: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
}

/* Search functionality */
.search-section {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  color: black;
}

.search-input:focus {
  outline: none;
  border-color: var(--festivall-baby-blue);
  box-shadow: 0 0 5px rgba(5, 155, 250, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--festivall-baby-blue);
  background: transparent;
  color: var(--festivall-baby-blue);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: var(--festivall-baby-blue);
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: white;
  font-weight: bold;
}

/* Export buttons */
.export-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.export-buttons button {
  background: var(--festivall-baby-blue);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.export-buttons button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .banner {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .logo {
    width: 60px;
  }

  h1 {
    font-size: 1.1rem;
    margin: 0;
  }

  .scanner-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.35rem;
    width: 100%;
  }

  .scanner-link {
    padding: 0.35rem 0.25rem;
    font-size: 0.62rem;
    border-radius: 8px;
    gap: 0.2rem;
    height: 64px;
    justify-content: center;
    line-height: 1.2;
    word-break: break-word;
  }

  .scanner-links .action-icon {
    width: 22px !important;
    transform: none !important;
  }

  .controls,
  .filters {
    margin-bottom: 0.25rem;
  }

  .buttons {
    gap: 0.4rem;
  }

  button {
    font-size: 0.75rem;
    padding: 0.25rem 0.4rem;
  }

  .export-buttons {
    gap: 0.4rem;
  }

  .export-buttons button {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .applicants {
    grid-template-columns: 1fr;
    padding: 0.25rem;
    gap: 0.5rem;
  }

  .applicant {
    max-width: 100%;
    height: auto;
    min-height: unset;
    overflow-y: hidden;
  }

  .applicant.collapsed {
    max-height: none;
    overflow-y: hidden;
  }

  .applicant.collapsed .detail-link-icon,
  .applicant.collapsed .applicant-content,
  .applicant.collapsed .ticket-content,
  .applicant.collapsed .actions {
    display: none;
  }

  .applicant:not(.collapsed) {
    max-height: 330px;
    overflow-y: auto;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    border-radius: 8px;
    background-color: #555;
    user-select: none;
    gap: 0.5rem;
    margin-bottom: 0;
  }

  .card-header-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.2rem;
    text-align: left;
    font-size: 0.82rem;
  }

  .card-types {
    color: #aaa;
    font-size: 0.72rem;
  }

  .card-toggle-btn {
    font-size: 0.7rem;
    color: var(--festivall-baby-blue);
    flex-shrink: 0;
  }

  .pagination {
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
  }

  .search-input {
    max-width: 100%;
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  img {
    margin: 0.2rem;
  }

  .message-section .action-icon {
    justify-self: center;
  }
}

/* Loading state for individual items */
.applicant.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Meal ticket controls */
.meal-management-section {
  text-align: center;
}

.meal-tickets-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.meal-btn {
  width: 32px;
  height: 32px;
  border: 2px solid var(--festivall-baby-blue);
  background: transparent;
  color: var(--festivall-baby-blue);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s ease;
}

.meal-btn:hover:not(:disabled) {
  background: var(--festivall-baby-blue);
  color: white;
}

.meal-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #666;
  color: #666;
}

.meal-count {
  font-weight: bold;
  color: var(--festivall-baby-blue);
  min-width: 30px;
  text-align: center;
}

.applicant.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 25%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 75%
  );
  background-size: 200% 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Card decline section ───────────────────────────────────────────────────── */
.card-decline-section {
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid #333;
}

.declined-badge-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-declined-badge {
  font-size: 9px;
  font-weight: 700;
  color: #ef5350;
  letter-spacing: 0.05em;
}

.card-decline-trigger {
  background-color: #4a1515 !important;
  color: #ef9a9a !important;
  border: 1px solid #7f1f1f !important;
  font-size: 9px !important;
  padding: 0.2rem 0.5rem !important;
  border-radius: 4px !important;
}

.card-decline-trigger:hover {
  background-color: #7f1f1f !important;
  color: #fff !important;
}

.card-decline-confirm {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.4rem;
  background-color: #2a1515;
  border: 1px solid #7f1f1f;
  border-radius: 4px;
  font-size: 10px;
}

.card-decline-warning {
  margin: 0 !important;
  font-size: 9px !important;
  color: #ef9a9a !important;
  font-style: italic;
}

.card-decline-select {
  padding: 0.25rem 0.3rem;
  border: 1px solid #555;
  border-radius: 3px;
  background-color: #1f1e22;
  color: #d0d0d0;
  font-size: 9px;
  cursor: pointer;
  width: 100%;
}

.card-decline-btns {
  display: flex;
  gap: 0.3rem;
  justify-content: flex-end;
}

.card-cancel-btn {
  background-color: #444 !important;
  color: #ccc !important;
  font-size: 9px !important;
  padding: 0.2rem 0.5rem !important;
  border-radius: 3px !important;
}

.card-cancel-btn:hover {
  background-color: #555 !important;
}

.card-confirm-decline-btn {
  background-color: #b71c1c !important;
  color: #fff !important;
  font-size: 9px !important;
  padding: 0.2rem 0.5rem !important;
  border-radius: 3px !important;
}

.card-confirm-decline-btn:hover {
  background-color: #7f0000 !important;
}

.card-restore-btn {
  background-color: #37474f !important;
  color: #ccc !important;
  font-size: 9px !important;
  padding: 0.2rem 0.5rem !important;
  border-radius: 3px !important;
}

.card-restore-btn:hover {
  background-color: #546e7a !important;
}

/* ── Compensation section ─────────────────────────────────────────────────── */
.compensation-section {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 0.35rem;
  margin-top: 0.35rem;
  padding: 0.35rem;
  border-radius: 10px;
  border: 1px solid var(--festivall-baby-blue);
  width: 100%;
  align-items: start;
  box-sizing: border-box;
}
.comp-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.comp-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.35rem;
  padding-top: 0.15rem;
  min-width: 70px;
}
.comp-monetary-row {
  display: flex;
  gap: 0.3rem;
  min-width: 0;
}
.comp-amount-input {
  flex: 1;
  min-width: 0;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  border: 1px solid #555;
  background: #1a1a1d;
  color: white;
  font-size: 0.8rem;
}
.comp-currency-select {
  width: 70px;
  flex: 0 0 70px;
  padding: 0.3rem 0.2rem;
  border-radius: 6px;
  border: 1px solid #555;
  background: #1a1a1d;
  color: white;
  font-size: 0.8rem;
}
.comp-text-input {
  width: 100%;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  border: 1px solid #555;
  background: #1a1a1d;
  color: white;
  font-size: 0.8rem;
  box-sizing: border-box;
}
.comp-addons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.2rem 0.5rem;
  min-width: 0;
}
.addon-toggle {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.75rem;
  color: #ccc;
  cursor: pointer;
  white-space: nowrap;
}

/* ── Payment method pills ─────────────────────────────────────────────────── */
.comp-payment-method {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-top: 0.2rem;
}

.comp-payment-label {
  font-size: 0.7rem;
  color: #aaa;
}

.comp-payment-btn {
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: 99px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.comp-payment-btn--bitcoin       { border: 1px solid #f7931a; color: #f7931a; }
.comp-payment-btn--bitcoin.comp-payment-btn--active { background: #f7931a; color: #000; }
.comp-payment-btn--cash          { border: 1px solid #4caf50; color: #4caf50; }
.comp-payment-btn--cash.comp-payment-btn--active    { background: #4caf50; color: #000; }
.comp-payment-btn--etransfer     { border: 1px solid #ff9800; color: #ff9800; }
.comp-payment-btn--etransfer.comp-payment-btn--active { background: #ff9800; color: #000; }
.comp-current-line {
  font-size: 0.8rem;
  margin: 0;
  color: #e0e0e0;
}
.comp-addon-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.1rem;
}
.addon-badge {
  background: #2a3a2a;
  color: #7ecb7e;
  border: 1px solid #3d5a3d;
  border-radius: 12px;
  padding: 0.1rem 0.45rem;
  font-size: 0.7rem;
  white-space: nowrap;
}
.comp-clear-btn {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #c0392b;
  background: transparent;
  color: #e74c3c;
  cursor: pointer;
  margin-top: 0.1rem;
}
.comp-clear-btn:hover {
  background: #c0392b;
  color: white;
}

@media (max-width: 920px) {
  .compensation-section {
    grid-template-columns: 3fr 1fr;
  }

  .comp-right {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.35rem;
    padding-top: 0.15rem;
    min-width: 70px;
  }

  .comp-clear-btn {
    align-self: flex-start;
    margin-top: 0.1rem;
  }

  .comp-addons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.5rem;
  }
}
</style>
