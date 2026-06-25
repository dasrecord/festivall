<template>
  <div class="ticket-page" v-if="order">
    <div class="ticket-header">
      <img :src="festivall_emblem_black" style="height: 38px; width: auto" alt="Festivall Emblem" />
      <div class="ticket-title">
        <h1>Reunion Festival {{ new Date().getFullYear() }}</h1>
        <CountdownTimer v-if="order.ticket_type === 'Weekend Pass'" />
        <CountdownTimer v-if="order.ticket_type === 'Day Pass'" :targetDay="parseInt(order.selected_day.split(',')[1].split(' ')[2].split('t')[0], 10)" />
      </div>
      <img :src="frog_image" style="height: 52px; width: 52px" alt="Frog" />
    </div>

    <div class="order-info">
      <div class="ticket-identity">
        <span class="ticket-name">{{ order.fullname }}</span>
        <span class="ticket-badge">{{ order.ticket_type === 'Weekend Pass' ? 'Weekend Pass' : 'Day Pass' }}</span>
      </div>
      <p class="ticket-valid">
        <strong>Valid:</strong>
        <span v-if="order.ticket_type === 'Weekend Pass'">Sep 4–7, 2026 · 12PM–12PM</span>
        <span v-else>{{ order.selected_day }} · 24H</span>
      </p>

      <div class="quantities">
        <div
          class="quantity clickable-entrance-section"
          @click="showEntranceActivityModal = true"
          title="Click for entrance activity history"
        >
          <p><strong>Admit:</strong>{{ order.ticket_quantity }}</p>
          <div class="icons">
            <img
              v-for="n in Number(order.ticket_quantity)"
              :key="n"
              :src="ticket_icon"
              style="
                height: auto;
                width: 32px;
                transform: translateY(8px) translateX(5px) rotate(-45deg);
              "
              alt="Ticket Icon"
            />
          </div>
        </div>

        <div
          class="quantity clickable-meal-section"
          @click="showMealRedemptionHistoryModal = true"
          title="Click for meal redemption history"
        >
          <p><strong>Meal Tickets:</strong>{{ order.meal_tickets_remaining }}</p>
          <div class="icons">
            <img
              v-for="n in Number(order.meal_tickets_remaining)"
              :key="n"
              :src="meals_icon"
              style="height: auto; width: 32px"
              alt="Meal Icon"
            />
          </div>
          <button
            v-if="order.meal_tickets_remaining === 0"
            @click.stop="showAdHocMealModal = true"
            style="font-size:0.7rem;padding:4px 10px;margin:4px;border-radius:20px;border:1px solid var(--reunion-frog-green);background:transparent;color:var(--reunion-frog-green);cursor:pointer;white-space:nowrap;"
          >🍽️ Buy Meals</button>
          <span
            v-if="pendingMealPurchases.length > 0"
            style="font-size:0.65rem;color:orange;margin:2px 0 4px;display:block;"
          >⏳ {{ pendingMealPurchases.length }} order{{ pendingMealPurchases.length > 1 ? 's' : '' }} pending</span>
        </div>
      </div>
      <div class="status-bar">
        <p class="status-btn" @click="showGateInfoModal = true">
          <img :src="status_icon" style="height: auto; width: 32px; margin: 0" alt="Status Icon" />
          <strong>Front Gate Info</strong>
        </p>
        <p class="status-btn" @click="showMealServiceModal = true">
          <img :src="meals_icon" style="height: auto; width: 32px; margin: 0; filter: invert(1)" alt="Meal Service Icon" />
          <strong>Meal Service Info</strong>
        </p>
        <p class="status-btn" @click="showReferralModal = true" v-if="referralEarnings >= 0">
          <img :src="bonus_icon" style="height: 32px; width: auto; margin: 0" alt="Bonus Icon" />
          <strong>Referral: ${{ referralEarnings }}</strong>
        </p>
        <p class="status-btn" @click="showFMRadioModal = true">
          <img :src="radio_icon" style="height: auto; width: 32px; margin: 0" alt="FM Radio Icon" />
          <strong>FM Radio</strong>
        </p>
        <p
          class="status-btn"
          v-if="
            (order.payment_type === 'inkind' || order.payment_type === 'In Kind') &&
            order.applicant_types.includes('Volunteer') &&
            order.volunteer_claimed_slots && order.volunteer_claimed_slots.length > 0
          "
          @click="showVolunteerShiftsModal = true"
        >
          <img :src="my_shifts_icon" style="height: auto; width: 32px; margin: 0" alt="Volunteer Shifts" />
          <strong>My Shifts ({{ order.volunteer_claimed_slots.length }})</strong>
        </p>
      </div>

      <div v-if="showPaymentModal" class="modal" @click.self="showPaymentModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showPaymentModal = false"></div>
          <img
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="payment_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Payment Icon"
          />
          <h2>Payment Status</h2>
          <span :class="{ paid: order.paid, 'not-paid': !order.paid }">
            {{ order.paid ? 'Paid' : 'Not Paid' }} </span
          ><br />

          <h3 v-if="order.paid === false">
            💳
            <strong style="text-decoration: underline; color: orange">Payment Instructions:</strong>
            <br />
            To complete your payment, please send <strong>${{ order.total_price }}</strong> to the
            following email address:
            <br />
            💰 <strong>humanoidtwo@gmail.com</strong>
            <br />
            Make sure to include the following code in the message section:
            <br />
            🔢 <strong>{{ order.id_code }}</strong> <br /><br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            We only accept cash and bitcoin at the Front Gate
            <br />
            💵 If you are paying with cash, please bring the exact amount.
            <br />
            ₿ If you are paying with bitcoin, please send the payment to the address provided in the
            <strong>Payment Instructions</strong> section above.
          </h3>
          <h3 v-else>Thank you so much for supporting Reunion Festival.<br /></h3>
          <h3>
            📧 If you have any issues with your payment, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca</a
            >
          </h3>

          <button @click="showPaymentModal = false">Close</button>
        </div>
      </div>

      <!-- Meal Redemption History Modal -->
      <div
        v-if="showMealRedemptionHistoryModal"
        class="modal"
        @click.self="showMealRedemptionHistoryModal = false"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showMealRedemptionHistoryModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="meals_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Meal Icon"
          />
          <h2>Meal Redemption History</h2>
          <h3>
            <strong style="color: orange"
              >Remaining Tickets: {{ order.meal_tickets_remaining }}</strong
            >
          </h3>

          <!-- Show meal redemption history if available -->
          <div
            v-if="order.meal_redemption_history && order.meal_redemption_history.length > 0"
            class="redemption-section"
          >
            <h3>
              🍽️
              <strong style="text-decoration: underline; color: orange"
                >Your Redemption History:</strong
              >
            </h3>
            <div class="history-list">
              <div
                v-for="(redemption, index) in order.meal_redemption_history"
                :key="index"
                class="history-item redemption-item"
              >
                <div class="redemption-time">
                  <strong>{{ redemption.festival_day }}</strong> -
                  {{ new Date(redemption.timestamp).toLocaleString() }}
                </div>
                <div class="redemption-details">
                  <span class="meal-badge">
                    🎫 {{ redemption.tickets_redeemed }} ticket{{
                      redemption.tickets_redeemed > 1 ? 's' : ''
                    }}
                    used
                  </span>
                  <span class="remaining-info"
                    >{{ redemption.remaining_after }} remaining after</span
                  >
                  <span class="operator-info">by {{ redemption.redeemed_by }}</span>
                  <span
                    v-if="redemption.reason && redemption.reason !== 'Normal redemption'"
                    class="reason-info"
                  >
                    ({{ redemption.reason }})
                  </span>
                </div>
              </div>
            </div>
            <br />
          </div>

          <h3 v-else>
            📊 <strong style="color: orange">No redemptions yet!</strong><br />
            Your meal tickets are ready to use during service hours.<br /><br />
          </h3>

          <h3>
            📧
            <strong style="color: orange">Questions about your redemption history?</strong> Contact
            the Food Team or
            <strong style="color: orange">Email: </strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showAdHocMealModal = true; showMealRedemptionHistoryModal = false">🍽️ Buy More Meals</button>
          <button @click="showMealRedemptionHistoryModal = false" style="background:transparent;color:white;border-color:white;margin-top:0.5rem;">Close</button>
        </div>
      </div>

      <!-- Entrance Activity Modal -->
      <div
        v-if="showEntranceActivityModal"
        class="modal"
        @click.self="showEntranceActivityModal = false"
      >
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showEntranceActivityModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="status_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Entrance Icon"
          />
          <h2>Entrance Activity History</h2>

          <!-- Show entrance activity history if available -->
          <div
            v-if="order.entrance_activity_history && order.entrance_activity_history.length > 0"
            class="activity-section"
          >
            <h3>
              🎪
              <strong style="text-decoration: underline; color: orange"
                >Your Gate Activity Timeline:</strong
              >
            </h3>
            <div class="history-list">
              <div
                v-for="(activity, index) in order.entrance_activity_history"
                :key="index"
                class="history-item"
                :class="{
                  'check-in-item': activity.action === 'check_in',
                  'check-out-item': activity.action === 'check_out'
                }"
              >
                <div class="activity-time">
                  <strong>{{ activity.festival_day }}</strong> -
                  {{ new Date(activity.timestamp).toLocaleString() }}
                </div>
                <div class="activity-details">
                  <span class="action-badge" :class="activity.action">
                    {{ activity.action === 'check_in' ? '🎪 Checked In' : '🚪 Checked Out' }}
                  </span>
                  <span class="operator-info"
                    >by {{ activity.operator_name || activity.operator }}</span
                  >
                </div>
              </div>
            </div>
            <br />
          </div>

          <h3 v-else>
            📊 <strong style="color: orange">No gate activity yet!</strong><br />
            Your entrance activities will appear here once you check in at the festival.<br /><br />
          </h3>

          <h3>
            📧 <strong style="color: orange">Questions about your activity history?</strong> Contact
            the Front Gate team or
            <strong style="color: orange">Email: </strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button
            v-if="order.ticket_quantity > 0 && order.paid"
            @click="showEntranceActivityModal = false; showTransferModal = true"
          >
            🎫 Transfer Ticket
          </button>
          <button @click="showEntranceActivityModal = false">Close</button>
        </div>
      </div>

      <!-- Referral Modal -->
      <div v-if="showReferralModal" class="modal" @click.self="showReferralModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showReferralModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img :src="bonus_icon" style="height: 64px; width: auto; margin: 0" alt="Bonus Icon" />
          <h2>Referral Earnings</h2>
          <strong> #{{ order.id_code }} </strong>
          <strong>${{ referralEarnings }}</strong>
          <h3>
            💰
            <strong style="text-decoration: underline; color: orange"
              >Referral Instructions:</strong
            ><br />
            You can share your Festivall ID_CODE or your referral link with your friends and
            family.<br />
            🎫 Remember, you earn $20 for each Weekend Pass and $10 for each Day Pass.<br />
          </h3>
          <h3>
            🔗
            <strong style="text-decoration: underline; color: orange">
              This is your referral link: </strong
            ><br />
            Copy and paste this link anywhere!
            <a
              :href="`https://festivall.ca/reuniontickets/${order.id_code}`"
              target="_blank"
              style="color: orange"
              >{{ `https://festivall.ca/reuniontickets/${order.id_code}` }} </a
            ><br />
          </h3>
          <h3>
            📱
            <strong style="text-decoration: underline; color: orange">
              This is your referral QR code:
            </strong>
          </h3>
          <div class="qr-code">
            <canvas ref="referralQrCanvas"></canvas>
          </div>
          <h3>
            👫 Have your friends scan this QR code to get their tickets.<br />
            🔢 Your ID_CODE will be automatically added to their order.<br />
          </h3>
          <h3>
            📧 If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange"
              >reunion@festivall.ca</a
            >
          </h3>

          <button @click="showReferralModal = false">Close</button>
        </div>
      </div>

      <!-- Volunteer Shifts Modal -->
      <div v-if="showVolunteerShiftsModal" class="modal" @click.self="showVolunteerShiftsModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showVolunteerShiftsModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="volunteer_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Volunteer Icon"
          />
          <h2>My Volunteer Shifts</h2>

          <div v-if="mergedClaimedSlots && mergedClaimedSlots.length > 0" class="redemption-section">
            <h3>
              🗓️ <strong style="text-decoration: underline; color: orange">Your Claimed Shifts:</strong>
            </h3>
            <div class="history-list">
              <div
                v-for="(slot, index) in mergedClaimedSlots"
                :key="index"
                :class="['history-item', slot.active === false ? 'inactive-shift' : '']"
                style="border-left: 3px solid #4caf50; padding-left: 0.75rem; margin-bottom: 0.75rem;"
              >
                <div class="shift-title-row" :style="slot.active === false ? 'color: #888; font-weight: 400;' : 'color: #4caf50; font-weight: bold;'">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center;">
                      <img
                        v-if="slot.team && teamIcons && Object.prototype.hasOwnProperty.call(teamIcons, slot.team.toLowerCase()) && teamIcons[slot.team.toLowerCase()]"
                        :src="teamIcons[slot.team.toLowerCase()]"
                        :alt="slot.team + ' icon'"
                        style="max-width: 54px; max-height: 54px; object-fit: contain; margin-right: 1em; display: block;"
                      />
                      <span style="font-size: 1.1em; font-weight: 600;">
                        {{ {
                          frontgate: 'Front Gate',
                          foodteam: 'Food Team',
                          setupcrew: 'Setup Crew',
                          stagecrew: 'Stage Crew',
                          cleanupcrew: 'Cleanup Crew',
                          arcadeattendant: 'Arcade Attendant'
                        }[slot.team && slot.team.toLowerCase()] || slot.team }}
                        <span v-if="slot.active === false" class="inactive-badge">inactive</span>
                      </span>
                    </div>
                    <div v-if="teamManuals[slot.team]" style="display: flex; flex-direction: column; align-items: center; margin-left: 1em;">
                      <RouterLink :to="teamManuals[slot.team]" style="text-decoration: none;">
                        <img :src="task_icon" alt="Task Icon" style="max-width: 38px; max-height: 38px; object-fit: contain; margin-bottom: 0.1em; display: block;" />
                        <span style="font-size: 0.85em; color: #fff;">Tasks</span>
                      </RouterLink>
                    </div>
                  </div>
                </div>
                <div :style="slot.active === false ? 'color: #aaa;' : ''">{{ slot.date }} · {{ slot.start }}–{{ slot.end }}</div>
                <div v-if="slot.title" :style="slot.active === false ? 'color: #bbb; font-size: 0.85rem;' : 'font-size: 0.85rem; color: #ccc;'">{{ slot.title }}</div>
                <div v-if="slot.active === false" style="color: #b0b0b0; font-size: 0.92em; margin-top: 0.2em;">
                  <span style="font-size: 1em;">This shift was disabled by organizers.<br> You do not need to attend.</span>
                </div>
                  <div v-if="teamManuals[slot.team]" style="margin-top: 0.5em;">
                    <!-- Manual link now shown as icon on the right, so this is removed. -->
                  </div>
              </div>
            </div>
            <br />
          </div>
          
          <h3 v-else>
            📊 <strong style="color: orange">No shifts claimed yet!</strong><br />
            Head to the Volunteer Hub to sign up for your shift.
          </h3>

          <h3>
            📧 Questions? Contact
            <a href="mailto:reunionvolunteercoordinator@festivall.ca" style="text-decoration: underline; color: orange">
              reunionvolunteercoordinator@festivall.ca
            </a>
          </h3>
          <button @click="showVolunteerShiftsModal = false">Close</button>
        </div>
      </div>

      <!-- FM Radio Modal -->
      <div v-if="showFMRadioModal" class="modal" @click.self="showFMRadioModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showFMRadioModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="radio_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="FM Radio Icon"
          />
          <h2>🎶 FM Radio Broadcast</h2>
          <h3>
            📻
            <strong style="text-decoration: underline; color: orange">Tune In:</strong><br />
            The main stage music is broadcast live over FM during the festival.<br />
            🚗 Listen from your car while you approach the festival grounds!<br />
            📻 Bring an FM radio or boombox for your campsite and listen at a respectful volume.<br />
          </h3>
          <h3>
            🔊
            <strong style="text-decoration: underline; color: orange">Broadcast Frequency:</strong><br />
            <strong style="font-size: 1.5rem; color: orange">TBA</strong><br />
            Check back closer to the festival for the exact frequency.<br />
          </h3>
          <h3>
            ℹ️
            <strong style="text-decoration: underline; color: orange">Tips:</strong><br />
            📡 FM signal covers the full festival grounds and surrounding campsites.<br />
            🔋 Bring extra batteries for portable radios and boomboxes.<br />
            🎛️ Adjust your antenna for the best reception at your campsite.<br />
          </h3>
          <h3>
            📧 Questions? Contact us at
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showFMRadioModal = false">Close</button>
        </div>
      </div>

      <!-- Gate Information Modal -->
      <div v-if="showGateInfoModal" class="modal" @click.self="showGateInfoModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showGateInfoModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="status_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Gate Info Icon"
          />
          <h2>Front Gate Information</h2>
          <h3>
            <strong style="color: orange">Current Check-In Status:</strong>
            <span :class="{ 'checked-in': order.checked_in, 'not-checked-in': !order.checked_in }">
              {{ order.checked_in ? 'Checked In' : 'Not Checked In' }}
            </span>
          </h3>

          <h3 v-if="order.checked_in === false">
            📋
            <strong style="text-decoration: underline; color: orange"
              >Check-In Instructions:</strong
            >
            <br />
            Present your QR code at the Front Gate along with a valid form of identification.<br />
            🎫 Your {{ order.ticket_quantity }} tickets will be scanned at the gate.<br />

            💲 Last-minute door sales will be subject to an additional $10 fee per ticket.<br /><br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            🕐 The Front Gate will close at {{ REUNION_FESTIVAL.gateCloseTime }} each night.<br />
            Please try to arrive before then.<br />
            🚫 With respected to substances, we have a<br />
            <strong> No Open Use Policy.<br /> </strong>
            👶 Please keep all adult materials out of sight and reach of minors.<br />
          </h3>
          <h3 v-else>
            🚪
            <strong style="text-decoration: underline; color: orange">
              Check-Out Instructions:</strong
            >
            <br />
            Please present your QR code at the Front Gate on your way out.<br />
            📊 This will help us keep track of how many people are still on the grounds.<br />
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            >
            <br />
            🕐 The Front Gate will close at {{ REUNION_FESTIVAL.gateCloseTime }} on each night.<br />
            Please try to check out before then.<br />
            🎒 If you are leaving the grounds, please make sure to take all of your belongings with
            you.<br />
            ⚠️ We are not responsible for any lost or stolen items.<br />
            <br />
          </h3>

          <h3
            v-if="order.applicant_types && order.applicant_types.includes('Artist' || 'Workshop')"
          >
            🎨
            <strong style="text-decoration: underline; color: orange">
              Artists and Workshops:</strong
            ><br />
            After checking in, please proceed to the Artist Loading Zone to drop off your gear and
            introduce yourself to the Stage Crew.<br />
            🚗 Once you're oriented, please take your vehicle to your campsite allowing others to
            load in.<br />
          </h3>

          <h3>
            📧 If you have any questions or concerns, please contact
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showGateInfoModal = false">Close</button>
        </div>
      </div>

      <!-- Meal Service Information Modal -->
      <div v-if="showMealServiceModal" class="modal" @click.self="showMealServiceModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showMealServiceModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="meals_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Meal Service Icon"
          />
          <h2>Meal Service Information</h2>

          <h3>
            📅
            <strong style="text-decoration: underline; color: orange">Meal Service Schedule:</strong
            ><br />
            Friday, Saturday & Sunday<br />
            Lunch: 12:00 PM - 2:00 PM<br />
            Supper: 6:00 PM - 8:00 PM<br />
          </h3>

          <h3>
            ✅ <strong style="text-decoration: underline; color: orange">How to Redeem:</strong
            ><br />
            Present your QR code at the meal station during service hours. <br />
            One ticket will be automatically deducted per meal.<br />
          </h3>

          <h3>
            ⚖️ <strong style="text-decoration: underline; color: orange">Important Policy:</strong
            ><br />
            Unused meal tickets are automatically decremented at the end of each meal service to
            ensure fairness for all attendees.<br />
          </h3>

          <h3>
            ℹ️
            <strong style="text-decoration: underline; color: orange"
              >Additional Information:</strong
            ><br />
            💰 No meal tickets remaining? Meals are $15 cash each<br />
            🌱 We accommodate dietary restrictions when possible<br />
            ⏰ Service may end early if food runs out<br />
          </h3>

          <h3>
            📧 <strong style="color: orange">Questions?</strong> Contact the Meal Team at the food
            station or
            <strong style="color: orange">Email: </strong>
            <a href="mailto:reunion@festivall.ca" style="text-decoration: underline; color: orange">
              reunion@festivall.ca
            </a>
          </h3>
          <button @click="showAdHocMealModal = true; showMealServiceModal = false">🍽️ Buy More Meals</button>
          <button @click="showMealServiceModal = false">Close</button>
        </div>
      </div>

      <!-- Ticket Transfer Modal -->
      <div v-if="showTransferModal" class="modal" @click.self="showTransferModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showTransferModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="ticket_icon"
            style="height: 64px; width: auto; margin: 0"
            alt="Ticket Icon"
          />
          <h2>Transfer Ticket</h2>
          <h3>
            👤 <strong style="color: orange">{{ order.fullname }}</strong><br />
            🎫 Available to transfer: <strong style="color: orange">{{ order.ticket_quantity }}</strong>
          </h3>
          <div style="width:100%;text-align:left;">
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Recipient Full Name:</label>
            <input
              type="text"
              v-model="transferForm.recipientFullname"
              placeholder="Jane Smith"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Recipient Email:</label>
            <input
              type="email"
              v-model="transferForm.recipientEmail"
              placeholder="jane@example.com"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Recipient Phone:</label>
            <input
              type="tel"
              v-model="transferForm.recipientPhone"
              placeholder="+1 (555) 555-5555"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Recipient ID_CODE <span style="color:#aaa;font-size:0.8rem;">(optional — if they already have one)</span>:</label>
            <input
              type="text"
              v-model="transferForm.recipientIdCode"
              placeholder="e.g. abc12"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Number of Tickets to Transfer:</label>
            <input
              type="number"
              v-model.number="transferForm.nTickets"
              :min="1"
              :max="order.ticket_quantity"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
          </div>
          <button @click="submitTransfer" :disabled="isTransferSubmitting">
            {{ isTransferSubmitting ? 'Transferring...' : '🎫 Confirm Transfer' }}
          </button>
          <button @click="showTransferModal = false" style="background:transparent;color:white;border-color:white;margin-top:0.5rem;">Cancel</button>
        </div>
      </div>

      <!-- Ad Hoc Meal Order Modal -->
      <div v-if="showAdHocMealModal" class="modal" @click.self="showAdHocMealModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-close" @click="showAdHocMealModal = false"></div>
          <img
            class="festivall-emblem"
            :src="festivall_emblem_white"
            style="height: 64px; width: auto"
            alt="Festivall Emblem"
          />
          <img
            :src="meals_icon"
            style="height: 64px; width: auto; margin: 0; filter: invert(1)"
            alt="Meal Icon"
          />
          <h2>Buy More Meals</h2>
          <h3>
            👤 <strong style="color: orange">{{ order.fullname }}</strong><br />
            🎫 Current meal tickets: <strong style="color: orange">{{ order.meal_tickets_remaining }}</strong>
          </h3>
          <h3>
            💰 <strong>${{ REUNION_FESTIVAL.pricing.mealAdHocPrice }} CAD per meal</strong><br />
            <img :src="bitcoin_icon" style="height:14px;width:14px;vertical-align:middle;" alt="Bitcoin" /> <strong style="color: orange">25% off with Bitcoin!</strong>
          </h3>
          <div style="width:100%;text-align:left;">
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Meal Quantity:</label>
            <input
              type="number"
              v-model.number="adHocMealForm.meal_quantity"
              min="1"
              @input="calculateAdHocMealPrice"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            />
            <label style="color:white;font-size:0.9rem;display:block;margin-bottom:4px;">Payment Method:</label>
            <select
              v-model="adHocMealForm.payment_type"
              @change="calculateAdHocMealPrice"
              style="width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--reunion-frog-green);background:#111;color:white;font-size:1rem;margin-bottom:0.75rem;"
            >
              <option value="" disabled>Choose a payment method</option>
              <option value="etransfer">E-transfer</option>
              <option value="bitcoin">Bitcoin (25% off)</option>
              <option value="cash">Cash at the Food Station</option>
            </select>
          </div>
          <h3 v-if="adHocMealForm.payment_type && adHocMealForm.total_price">
            <span v-if="adHocMealForm.payment_type === 'bitcoin'">
              Total: <strong style="color: orange">{{ adHocMealForm.total_price }} BTC</strong>
            </span>
            <span v-else>
              Total: <strong style="color: orange">${{ adHocMealForm.total_price }} CAD</strong>
            </span>
          </h3>
          <button @click="submitAdHocMealOrder" :disabled="isAdHocSubmitting">
            {{ isAdHocSubmitting ? 'Processing...' : '🍽️ Confirm Order' }}
          </button>
          <button @click="showAdHocMealModal = false" style="background:transparent;color:white;border-color:white;margin-top:0.5rem;">Close</button>
        </div>
      </div>

      <div class="links">
        <RouterLink
          v-if="
            (order.payment_type === 'inkind' || order.payment_type === 'In Kind') &&
            order.applicant_types.includes('Volunteer')
          "
          style="grid-column: span 2"
          to="/reunion-volunteer-welcome"
          id="volunteer-welcome"
        >
          <p>
            <img :src="volunteer_icon" style="height: auto; width: 36px" alt="Volunteer Icon" />
            Volunteer Hub & Shift Signup
          </p>
        </RouterLink>
        <div
          v-if="
            (order.applicant_types?.includes('Artist') ||
              order.applicant_types?.includes('Workshop')) &&
            order.settimes?.length > 0
          "
          style="grid-column: span 2; cursor: pointer"
          @click.prevent="downloadSettimes"
        >
          <p style="text-align: center">
            <img
              :src="order.applicant_types?.includes('Artist') ? dj_icon : workshop_icon"
              style="height: auto; width: 36px"
              :alt="order.applicant_types?.includes('Artist') ? 'Artist Icon' : 'Workshop Icon'"
            />
            Download Your Set Times:
            <span v-for="(settime, index) in order.settimes" :key="index">
              {{
                new Date(settime).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
              }}
            </span>
          </p>
        </div>

        <!-- Artist self-service chips -->
        <div
          v-if="isArtistEditEligible || isVisualsPickerEligible"
          class="artist-chips"
          style="grid-column: span 2;"
        >
          <button
            v-if="isArtistEditEligible"
            type="button"
            class="artist-chip"
            @click="showEditArtistModal = true"
          >
            ✏️ Edit My Artist Info
          </button>
          <button
            v-if="isVisualsPickerEligible"
            type="button"
            class="artist-chip"
            @click="showVisualsPickerModal = true"
          >
            🎞️ Choose Your Visuals
          </button>
        </div>
        <div style="grid-column: span 2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
          <RouterLink to="/reunionlocation">
            <p>
              <img :src="location_icon" style="height: auto; width: 20px" alt="Location Icon" />
              Location
            </p>
          </RouterLink>
          <div class="poster-tile" @click="activePoster = poster2025">
            <p>
              <img :src="poster2025" style="height: 32px; width: auto; object-fit: contain" alt="Poster" />
              2025 Poster
            </p>
          </div>
          <!-- <div @click="activePoster = poster2026">
            <p>
              <img :src="poster2026" style="height: 32px; width: auto; object-fit: contain" alt="Poster" />
              2026 Poster
            </p>
          </div> -->
          <RouterLink :to="{ path: '/reunionmap', query: { id_code: order.id_code } }">
            <p>
              <img :src="map_icon" style="height: auto; width: 40px" alt="Grounds Map" />
              Grounds Map
            </p>
          </RouterLink>
          <RouterLink :to="{ path: '/reuniongenremap', query: { id_code: order.id_code } }">
            <p>
              <img :src="genre_map_icon" style="height: auto; width: 32px" alt="Genre Map" />
              Genre Map
            </p>
          </RouterLink>
        </div>
        <RouterLink v-if="new Date() >= REUNION_FESTIVAL.lineupRevealDate" to="/reunionlineup">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px" alt="Lineup Icon" />
            2026 Lineup<br />Look & Listen!<br />
          </p>
        </RouterLink>
        <RouterLink v-else to="#">
          <p>
            <img :src="lineup_icon" style="height: auto; width: 32px; " alt="Coming Soon Icon" />
            2026 Lineup<br />TBA
          </p>
        </RouterLink>

        <RouterLink :to="new Date() >= REUNION_FESTIVAL.festivalOpenDate ? { name: 'ScavengerHunt', params: { id_code: order.id_code }, query: { fullName: order.fullname.split(' ')[0] } } : '#'">
          <p>
            <img :src="quiz_icon" style="height: auto; width: 32px" alt="Scavenger Hunt Icon" />
            Scavenger Hunt<br />{{ new Date() >= REUNION_FESTIVAL.festivalOpenDate ? 'Win some Bitcoin!' : 'Opens: ' + new Date(REUNION_FESTIVAL.festivalOpenDate).toLocaleDateString() }}
          </p>
        </RouterLink>
      </div>
    </div>

    <PosterSplash v-if="activePoster" :src="activePoster" @dismissed="activePoster = null" />

    <EditArtistInfoModal
      v-if="showEditArtistModal"
      :order="order"
      :application-data="order.application_data || {}"
      @close="showEditArtistModal = false"
      @saved="onArtistInfoSaved"
    />

    <VisualsPickerModal
      v-if="showVisualsPickerModal"
      :order="order"
      :application-data="order.application_data || {}"
      @close="showVisualsPickerModal = false"
      @saved="onVisualsSelectionSaved"
    />

    <div class="qr-code">
      <canvas ref="qrCanvas"></canvas>
    </div>

    <img class="footer" :src="poster_footer" style="width: 100%" alt="Poster Footer" />
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs, query, where, updateDoc, arrayUnion } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import { transferTicket } from '@/composables/useTicketTransfer'
import { reunion_db, festivall_auth } from '@/firebase'
import QRCode from 'qrcode'
import axios from 'axios'
import frog_image from '@/assets/images/frog.png'
import festivall_emblem_black from '@/assets/images/festivall_emblem_black.png'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import poster_footer from '@/assets/images/poster_footer_v1.png'
import ticket_icon from '@/assets/images/icons/ticket_black.png'
import meals_icon from '@/assets/images/icons/meals_black.png'
import payment_icon from '@/assets/images/icons/compensation.png'
import status_icon from '@/assets/images/icons/front_gate.png'
import my_shifts_icon from '@/assets/images/icons/my_shifts.png'
import bonus_icon from '@/assets/images/icons/bonus.png'
import volunteer_icon from '@/assets/images/icons/volunteer.png'
import dj_icon from '@/assets/images/icons/dj.png'
import workshop_icon from '@/assets/images/icons/workshop.png'
import location_icon from '@/assets/images/icons/location.png'
import map_icon from '@/assets/images/icons/grounds_map.png'
import genre_map_icon from '@/assets/images/icons/genre_map.png'
import lineup_icon from '@/assets/images/icons/lineup.png'
import quiz_icon from '@/assets/images/icons/quiz.png'
import radio_icon from '@/assets/images/icons/radio.png'
import frontgate_icon from '@/assets/images/icons/front_gate.png'
import foodteam_icon from '@/assets/images/icons/food.png'
import setupcrew_icon from '@/assets/images/icons/setup_crew.png'
import stagecrew_icon from '@/assets/images/icons/stage_crew.png'
import cleanupcrew_icon from '@/assets/images/icons/cleanup_crew.png'
import arcadeattendant_icon from '@/assets/images/icons/arcade.png'
import task_icon from '@/assets/images/icons/task.png'
import bitcoin_icon from '@/assets/images/bitcoin.svg?url'
import poster2026 from '@/assets/images/reunion_2026_poster_v1.svg?url'
import poster2025 from '@/assets/images/reunion_2025_poster_v2.svg?url'
import poster2024 from '@/assets/images/reunion_2024_poster_v1.png?url'
import CountdownTimer from '@/components/CountdownTimer.vue'
import PosterSplash from '@/components/PosterSplash.vue'
import EditArtistInfoModal from '@/components/EditArtistInfoModal.vue'
import VisualsPickerModal from '@/components/VisualsPickerModal.vue'
import { useLineupState } from '@/composables/useLineupState'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

export default {
  name: 'TicketPageView',
  components: {
    CountdownTimer,
    PosterSplash,
    EditArtistInfoModal,
    VisualsPickerModal
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const { currentAct } = useLineupState()
    const order = ref(null)
      // Holds the merged slots with up-to-date active status
      const mergedClaimedSlots = ref([])
    const qrCanvas = ref(null)
    const referralEarnings = ref(0)
    const referralQrCanvas = ref(null)

    const showPaymentModal = ref(false)
    const showGateInfoModal = ref(false)
    const showMealServiceModal = ref(false)
    const showReferralModal = ref(false)
    const showMealRedemptionHistoryModal = ref(false)
    const showEntranceActivityModal = ref(false)
    const showFMRadioModal = ref(false)
    const showVolunteerShiftsModal = ref(false)
    const showAdHocMealModal = ref(false)
    const isAdHocSubmitting = ref(false)
    const showTransferModal = ref(false)
    const isTransferSubmitting = ref(false)
    const showEditArtistModal = ref(false)
    const showVisualsPickerModal = ref(false)
    const transferForm = ref({ recipientFullname: '', recipientEmail: '', recipientPhone: '', recipientIdCode: '', nTickets: 1 })
    const btcRate = ref(0)
    const adHocMealForm = ref({ meal_quantity: 1, payment_type: '', total_price: 0 })
    const pendingMealPurchases = ref([])
    const activePoster = ref(null)

      // Efficient team manual links map
      const teamManuals = {
        frontgate: '/reunionfrontgate',
        foodteam: '/reunionfoodteam',
        setupcrew: '/reunionsetupcrew',
        stagecrew: '/reunionstagecrew',
        cleanupcrew: '/reunioncleanupcrew',
        arcadeattendant: '/reunionarcadeattendant'
      }

    // Map team keys to their icon paths
    const teamIcons = {
      frontgate: frontgate_icon,
      foodteam: foodteam_icon,
      setupcrew: setupcrew_icon,
      stagecrew: stagecrew_icon,
      cleanupcrew: cleanupcrew_icon,
      arcadeattendant: arcadeattendant_icon,
    }

    const fetchBtcRate = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad'
        )
        btcRate.value = response.data.bitcoin.cad
      } catch (error) {
        console.error('Error fetching BTC rate:', error)
      }
    }

    const calculateAdHocMealPrice = () => {
      const { mealAdHocPrice } = REUNION_FESTIVAL.pricing
      const qty = adHocMealForm.value.meal_quantity
      const total = qty * mealAdHocPrice
      if (adHocMealForm.value.payment_type === 'bitcoin') {
        adHocMealForm.value.total_price = ((total * 0.75) / btcRate.value).toFixed(8)
      } else {
        adHocMealForm.value.total_price = total
      }
    }

    const generateAdHocPaymentInstructions = () => {
      const { meal_quantity, payment_type, total_price } = adHocMealForm.value
      const { mealAdHocPrice } = REUNION_FESTIVAL.pricing
      if (payment_type === 'etransfer') {
        return `Please e-transfer $${total_price} CAD to humanoidtwo@gmail.com\nEnter your ID code in the message: ${order.value.id_code}\nOrder: ${meal_quantity} meal ticket(s) @ $${mealAdHocPrice} each`
      } else if (payment_type === 'bitcoin') {
        return `Pay ${total_price} BTC (25% discount applied)\nYour ID code: ${order.value.id_code}\nOrder: ${meal_quantity} meal ticket(s)`
      } else if (payment_type === 'cash') {
        return `Please bring $${total_price} CAD cash to the Food Team station.\nID code: ${order.value.id_code}\nOrder: ${meal_quantity} meal ticket(s) @ $${mealAdHocPrice} each`
      }
      return ''
    }

    const submitAdHocMealOrder = async () => {
      if (isAdHocSubmitting.value) return
      const { meal_quantity, payment_type } = adHocMealForm.value
      if (!meal_quantity || meal_quantity < 1) {
        alert('Please enter at least 1 meal.')
        return
      }
      if (!payment_type) {
        alert('Please select a payment method.')
        return
      }
      try {
        isAdHocSubmitting.value = true
        calculateAdHocMealPrice()
        const instructions = generateAdHocPaymentInstructions()
        const { total_price } = adHocMealForm.value

        // SMS
        await axios.post('https://relayproxy.vercel.app/sms', {
          value1: order.value.phone,
          value2: instructions,
          value3: '⟢Powered by Festivall⟣'
        }, { headers: { 'Content-Type': 'application/json' } })

        // Email
        await axios.post('https://relayproxy.vercel.app/email', {
          value1: order.value.email,
          value2: `Meal Order - Reunion ${REUNION_FESTIVAL.year}`,
          value3: instructions.replace(/\n/g, '<br />')
        }, { headers: { 'Content-Type': 'application/json' } })

        // Firestore update — write as PENDING, no increment yet
        const participantRef = doc(reunion_db, 'participants_2026', order.value.id_code)
        const pendingEntry = {
          timestamp: new Date().toISOString(),
          meal_quantity: Number(meal_quantity),
          payment_type,
          fiat_total: payment_type === 'bitcoin'
            ? Number((meal_quantity * REUNION_FESTIVAL.pricing.mealAdHocPrice * 0.75).toFixed(2))
            : Number(meal_quantity * REUNION_FESTIVAL.pricing.mealAdHocPrice),
          id_code: order.value.id_code,
          status: 'pending'
        }
        await updateDoc(participantRef, {
          'order.pending_meal_purchases': arrayUnion(pendingEntry)
        })

        // Update local pending state
        pendingMealPurchases.value = [...pendingMealPurchases.value, pendingEntry]

        // Slack
        const displayPrice = payment_type === 'bitcoin'
          ? `:bitcoin: ${total_price} BTC`
          : `:moneybag: $${total_price} CAD`
        await axios.post('https://relayproxy.vercel.app/reunion_sales', {
          text: `:fork_and_knife: AD HOC MEAL ORDER (PENDING)\n:bust_in_silhouette: ${order.value.fullname}\n:id: ${order.value.id_code}\n:knife_fork_plate: ${meal_quantity} meal ticket(s)\n${displayPrice}\n:credit_card: ${payment_type}\n:hourglass: Awaiting ${payment_type === 'cash' ? 'cash confirmation at Food Station' : 'payment verification'}`
        }, { headers: { 'Content-Type': 'application/json' } })

        alert(`Meal order submitted!\nCheck your phone and email for payment instructions.\nYour ${meal_quantity} meal ticket(s) will be added once payment is confirmed.`)
        showAdHocMealModal.value = false
        adHocMealForm.value = { meal_quantity: 1, payment_type: '', total_price: 0 }
      } catch (error) {
        console.error('Error submitting ad hoc meal order:', error)
        alert('Something went wrong. Please try again or contact the Food Team.')
      } finally {
        isAdHocSubmitting.value = false
      }
    }

    const submitTransfer = async () => {
      if (isTransferSubmitting.value) return
      const { recipientFullname, recipientEmail, recipientPhone, recipientIdCode, nTickets } = transferForm.value
      if (!recipientFullname.trim()) { alert('Please enter the recipient\'s full name.'); return }
      if (!recipientEmail.trim()) { alert('Please enter the recipient\'s email address.'); return }
      if (!recipientPhone.trim()) { alert('Please enter the recipient\'s phone number.'); return }
      if (!nTickets || nTickets < 1) { alert('Please enter at least 1 ticket to transfer.'); return }
      if (nTickets > order.value.ticket_quantity) { alert(`You only have ${order.value.ticket_quantity} ticket(s) to transfer.`); return }
      if (!confirm(`Transfer ${nTickets} ticket(s) to ${recipientFullname.trim()}?`)) return
      try {
        isTransferSubmitting.value = true
        await transferTicket({
          originalIdCode: order.value.id_code,
          fromName: order.value.fullname,
          recipientFullname,
          recipientEmail,
          recipientPhone,
          recipientIdCode: recipientIdCode?.trim() || '',
          nTickets: Number(nTickets),
          originalOrder: order.value
        })
        order.value.ticket_quantity = order.value.ticket_quantity - Number(nTickets)
        showTransferModal.value = false
        transferForm.value = { recipientFullname: '', recipientEmail: '', recipientPhone: '', recipientIdCode: '', nTickets: 1 }
        alert(`Transfer complete! ${recipientFullname.trim()} has been notified by email and SMS.`)
      } catch (err) {
        console.error('Transfer error:', err)
        alert(err.message || 'Transfer failed. Please try again.')
      } finally {
        isTransferSubmitting.value = false
      }
    }

    const calculateReferralEarnings = async (id_code) => {
      try {
        const referralQuery = query(
          collection(reunion_db, 'participants_2026'),
          where('referral.referral_id_code', '==', id_code)
        )

        const referralSnapshot = await getDocs(referralQuery)

        let totalEarnings = 0
        referralSnapshot.forEach((docSnap) => {
          const p = docSnap.data()
          if (p.order?.paid !== true) {
            return
          }

          const ticketType = p.order?.ticket_type
          const ticketQuantity = p.order?.original_ticket_quantity || p.order?.ticket_quantity || 0
          const earningsPerTicket =
            ticketType === 'Weekend Pass' ? 20 : ticketType === 'Day Pass' ? 10 : 0
          totalEarnings += earningsPerTicket * ticketQuantity
        })

        referralEarnings.value = totalEarnings
      } catch (error) {
        console.error('Error calculating referral earnings:', error)
      }
    }

    const loadOrder = async (id_code) => {
          // Helper: fetch all claimed slot_ids and merge in current slot data
          const mergeClaimedSlotsWithStatus = async (claimedSlots) => {
            if (!Array.isArray(claimedSlots) || claimedSlots.length === 0) return []
            // Get all slot_ids
            const slotIds = claimedSlots.map(s => s.slot_id).filter(Boolean)
            if (slotIds.length === 0) return claimedSlots
            // Query all slots in one go
            let slotDocs = []
            try {
              // Firestore 'in' query supports up to 10 items; fallback to individual fetch if needed
              if (slotIds.length <= 10) {
                const slotsQuery = query(collection(reunion_db, 'volunteer_slots_2026'), where('__name__', 'in', slotIds))
                const snap = await getDocs(slotsQuery)
                slotDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
              } else {
                // Too many for 'in' query, fetch individually
                slotDocs = []
                for (const slot_id of slotIds) {
                  try {
                    const d = await getDoc(doc(reunion_db, 'volunteer_slots_2026', slot_id))
                    if (d.exists()) slotDocs.push({ id: d.id, ...d.data() })
                  } catch { /* skip missing slot */ }
                }
              }
            } catch (e) {
              // fallback: fetch individually if 'in' query fails
              slotDocs = []
              for (const slot_id of slotIds) {
                try {
                  const d = await getDoc(doc(reunion_db, 'volunteer_slots_2026', slot_id))
                  if (d.exists()) slotDocs.push({ id: d.id, ...d.data() })
                } catch { /* skip missing slot */ }
              }
            }
            // Map by id for fast lookup
            const slotMap = Object.fromEntries(slotDocs.map(s => [s.id, s]))
            // Merge active status into claimed slots
            return claimedSlots.map(s => {
              const slot = slotMap[s.slot_id]
              return slot ? { ...s, active: slot.active !== false } : { ...s }
            })
          }

      try {
        if (!id_code) {
          throw new Error('ID code is undefined')
        }

        // Security check: require email verification (skip if admin is logged in via Firebase Auth)
        const isAdmin = !!festivall_auth.currentUser
        const storedAuth = sessionStorage.getItem(`verified_${id_code}`)
        if (!isAdmin && !storedAuth) {
          const email = prompt(
            'For security, please enter the email address associated with this ticket here:'
          )
          if (!email) {
            router.push({ name: 'EnterIDCode' })
            return
          }

          // Verify email matches participant contact
          const verificationQuery = query(
            collection(reunion_db, 'participants_2026'),
            where('id_code', '==', id_code),
            where('contact.email', '==', email.toLowerCase().trim())
          )
          const verificationSnapshot = await getDocs(verificationQuery)

          if (verificationSnapshot.empty) {
            alert('Email does not match this ticket. Access denied.')
            router.push({ name: 'EnterIDCode' })
            return
          }

          // Store verification for this session
          sessionStorage.setItem(`verified_${id_code}`, 'true')
        }

        // Load participant by id_code
        const q = query(
          collection(reunion_db, 'participants_2026'),
          where('id_code', '==', id_code)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const p = querySnapshot.docs[0].data()

          // Check if participant has a valid ticket (either purchased or earned through contract)
          const hasValidOrder = p.order && p.order.paid === true
          const hasSignedContract = p.contract && p.contract.signed === true

          if (!hasValidOrder && !hasSignedContract) {
            alert(
              'No valid ticket found for this ID code. You may need to purchase a ticket or complete your contract signing process.'
            )
            router.push({ name: 'EnterIDCode' })
            return
          }

          // If they only have a signed contract but no order, they might need to complete setup
          if (hasSignedContract && !hasValidOrder) {
            alert(
              'Contract signed but ticket not yet activated. Please contact admin to complete your ticket setup.'
            )
            router.push({ name: 'EnterIDCode' })
            return
          }

          // Normalize to previous shape for UI expectations
          order.value = {
            id_code: p.id_code,
            id_code_long: p.id_code_long,
            fullname: p.contact?.fullname || '',
            email: p.contact?.email || '',
            phone: p.contact?.phone || '',
            ticket_type: p.order?.ticket_type || '',
            selected_day: p.order?.selected_day || '',
            total_price: p.order?.fiat_total_price_cad || 0,
            currency: 'CAD',
            paid: p.order?.paid || false,
            original_ticket_quantity: p.order?.original_ticket_quantity || 0,
            ticket_quantity: p.order?.ticket_quantity || 0,
            meal_packages: p.order?.meal_packages || 0,
            meal_tickets_remaining: p.order?.meal_tickets_remaining || 0,
            checked_in: p.order?.checked_in || false,
            // Corrected field mapping for scanning history
            entrance_activity_history: p.order?.entrance_activity_history || [],
            last_entrance_activity: p.order?.last_entrance_activity || null,
            meal_redemption_history: p.order?.meal_redemption_history || [],
            pending_meal_purchases: p.order?.pending_meal_purchases || [],
            // Roles & application data
            applicant_types: p.roles?.applicant_types || [],
            payment_type: p.order?.payment_type || '',
            rates: p.application?.data?.rates || '',
            // Settimes are stored at the document root (written by DashboardPanel's
            // updateSettime as `settimes: [...]`), with a legacy fallback to
            // application.data.settimes for older records.
            settimes: p.settimes || p.application?.data?.settimes || [],
            // Raw application.data for self-edit modals (read-only snapshot)
            application_data: p.application?.data || {},
            // Volunteer shift data
            volunteer_claimed_slots: p.volunteer?.claimed_slots || []
          }

          // Merge claimed slots with up-to-date status and set mergedClaimedSlots
          pendingMealPurchases.value = p.order?.pending_meal_purchases || []
          mergedClaimedSlots.value = await mergeClaimedSlotsWithStatus(order.value.volunteer_claimed_slots)

          await nextTick()
          generateQRCode(order.value.id_code_long, qrCanvas.value)
          await calculateReferralEarnings(order.value.id_code)
        } else {
          console.error('No such document!')
          alert('No order found with this ID code. Please check your ID code and try again.')
          router.push({ name: 'EnterIDCode' })
        }
      } catch (error) {
        console.error('Error getting document:', error)
        router.push({ name: 'EnterIDCode' })
      }
    }

    const generateQRCode = (text, targetCanvas) => {
      if (targetCanvas) {
        QRCode.toCanvas(targetCanvas, text, { width: 200, height: 200 }, (error) => {
          if (error) {
            console.error('Error generating QR code:', error)
          }
        })
      }
    }

    const downloadSettimes = () => {
      if (!order.value || !order.value.settimes || order.value.settimes.length === 0) {
        alert('Set time information not available')
        return
      }

      // Helper function to format dates for iCalendar (YYYYMMDDTHHMMSS)
      const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}${month}${day}T${hours}${minutes}${seconds}`
      }

      // Get current timestamp for DTSTAMP
      const now = new Date()
      const timestamp = formatDate(now)

      // Start building the iCalendar content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festivall//Reunion Festival//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ]

      // Iterate over all settimes and create a VEVENT for each
      order.value.settimes.forEach((settime, index) => {
        const startDate = new Date(settime)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour to start time

        const startFormatted = formatDate(startDate)
        const endFormatted = formatDate(endDate)

        // Create a unique UID
        const uid = `${order.value.id_code_long}-${index}-${timestamp}@festivall.ca`

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${timestamp}`,
          `CREATED:${timestamp}`,
          `DTSTART:${startFormatted}`,
          `DTEND:${endFormatted}`,
          `SUMMARY:Your Set at Reunion Festival ${new Date().getFullYear()}`,
          'LOCATION:Reunion Festival',
          `DESCRIPTION:Your performance slot at Reunion Festival ${new Date().getFullYear()}. Please arrive at the stage a few minutes early to ensure smooth changeovers. Your main point of contact is Arthur, the Lead Sound Tech. If Arthur is unavailable, other stage crew members include Brandon, Cory, and Prasenjit.`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'TRANSP:OPAQUE',
          'CLASS:PUBLIC',
          'END:VEVENT'
        )
      })

      // End the iCalendar content
      icsContent.push('END:VCALENDAR')

      // Create blob and trigger download
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reunion_festival_set_times.ics`)
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    watch(showReferralModal, async (isVisible) => {
      if (isVisible && order.value) {
        await nextTick() // Wait for the DOM to update
        generateQRCode(
          `https://festivall.ca/reuniontickets/${order.value.id_code}`,
          referralQrCanvas.value
        )
      }
    })

    // ── Artist self-service eligibility ─────────────────────────────────────
    const beforeEditCutoff = () => new Date() < REUNION_FESTIVAL.artistEditing.editCutoff

    const isArtistEditEligible = computed(() =>
      !!order.value?.applicant_types?.includes('Artist') && beforeEditCutoff()
    )

    // A settime falls in the nighttime window if its LOCAL hour:minute is inside
    // [start, end). The window is wrap-around (e.g. 20:50–04:00 crosses midnight).
    const isInNighttimeWindow = (isoTime) => {
      const { start, end } = REUNION_FESTIVAL.visuals.nighttimeWindow
      const d = new Date(isoTime)
      if (isNaN(d.getTime())) return false
      // Format in Mountain Time regardless of viewer locale.
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Regina', hour12: false,
        hour: '2-digit', minute: '2-digit',
      }).formatToParts(d)
      const hh = parts.find((p) => p.type === 'hour').value
      const mm = parts.find((p) => p.type === 'minute').value
      const minutes = parseInt(hh, 10) * 60 + parseInt(mm, 10)
      const [sH, sM] = start.split(':').map(Number)
      const [eH, eM] = end.split(':').map(Number)
      const startMin = sH * 60 + sM
      const endMin   = eH * 60 + eM
      return startMin <= endMin
        ? minutes >= startMin && minutes < endMin
        : minutes >= startMin || minutes < endMin
    }

    const isVisualsPickerEligible = computed(() => {
      if (!order.value?.applicant_types?.includes('Artist')) return false
      if (!beforeEditCutoff()) return false
      const settimes = order.value?.settimes || []
      return settimes.some(isInNighttimeWindow)
    })

    // After a successful save, merge changes into the local order so the UI
    // reflects them without a full reload.
    const onArtistInfoSaved = ({ values }) => {
      if (!order.value) return
      order.value.application_data = { ...order.value.application_data, ...values }
      if ('rates' in values) order.value.rates = values.rates
    }

    const onVisualsSelectionSaved = (visuals_selection) => {
      if (!order.value) return
      order.value.application_data = {
        ...order.value.application_data,
        visuals_selection,
      }
    }

    onMounted(() => {
      const id_code = route.params.id_code
      referralEarnings.value = 0
      fetchBtcRate()
      if (id_code) {
        loadOrder(id_code)
      } else {
        router.push({ name: 'EnterIDCode' })
      }
      console.log('Settimes:', order.value?.settimes)
    })

    return {
      frog_image,
      festivall_emblem_white,
      festivall_emblem_black,
      poster_footer,
      order,
      qrCanvas,
      referralQrCanvas,
      generateQRCode,
      referralEarnings,
      calculateReferralEarnings,
      showPaymentModal,
      showGateInfoModal,
      showMealServiceModal,
      showReferralModal,
      showMealRedemptionHistoryModal,
      showEntranceActivityModal,
      showFMRadioModal,
      showVolunteerShiftsModal,
      showAdHocMealModal,
      isAdHocSubmitting,
      showTransferModal,
      isTransferSubmitting,
      showEditArtistModal,
      showVisualsPickerModal,
      isArtistEditEligible,
      isVisualsPickerEligible,
      onArtistInfoSaved,
      onVisualsSelectionSaved,
      transferForm,
      submitTransfer,
      btcRate,
      adHocMealForm,
      pendingMealPurchases,
      calculateAdHocMealPrice,
      submitAdHocMealOrder,
      downloadSettimes,
      ticket_icon,
      meals_icon,
      payment_icon,
      status_icon,
      bonus_icon,
      volunteer_icon,
      my_shifts_icon,
      workshop_icon,
      dj_icon,
      location_icon,
      map_icon,
      genre_map_icon,
      lineup_icon,
      quiz_icon,
      currentAct,
      radio_icon,
      bitcoin_icon,
      REUNION_FESTIVAL,
      mergedClaimedSlots,
      teamManuals,
      teamIcons,
      task_icon,
      activePoster,
      poster2026,
      poster2025,
      poster2024,
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Helvetica', sans-serif;
  /* border: 1px solid lime; */
}

.countdowntimer {
  background-color: var(--reunion-frog-green);
  color: white;
}

strong {
  font-weight: bold;
}

.ticket-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  color: black;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 100vw;
  height: auto;
  /* padding: 1rem 3rem; */
}
.ticket-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  width: 100%;
}

.ticket-title {
  flex: 1;
  text-align: center;
}

.ticket-identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.ticket-name {
  font-weight: bold;
  font-size: 1rem;
}

.ticket-badge {
  background: var(--reunion-frog-green);
  color: black;
  font-weight: bold;
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  white-space: nowrap;
}

.ticket-valid {
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0 !important;
  opacity: 0.85;
}

h1,
h2,
a {
  color: var(--reunion-frog-green);
  text-align: center;
  font-weight: bold;
  margin: 0;
  padding: 0;
}

.order-info {
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
  padding: 0.5rem 0.5rem;
  z-index: 2;
  width: 100%;
}

.order-info p {
  margin: 0 0 0.5rem 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.order-info img {
  margin: 0 0.5rem 0.7rem 0;
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 0.5rem ;

}

.status-btn {
  justify-content: center;
  background-color: black;
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  margin: 0;
}

.quantities {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  text-align: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border: 1px solid var(--reunion-frog-green);
  border-radius: 10px;
}

.clickable-meal-section {
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.clickable-meal-section:hover {
  border-color: var(--reunion-frog-green);
  border-width: 2px;
}

.clickable-entrance-section {
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.clickable-entrance-section:hover {
  border-color: var(--reunion-frog-green);
  border-width: 2px;
}

.type {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.order-info .links img {
  margin: 0;
}
.links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  color: white;
}

.links p {
  background-color: var(--reunion-frog-green);
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 0.5rem 0 0.3rem 0;
  margin: 0;
}

.links a {
  color: white;
  padding: 0;
  /* text-decoration: underline; */
}

a:hover {
  text-decoration: underline;
  background: none;
}

.links .poster-tile {
  cursor: pointer;
}

.links .poster-tile:hover p {
  text-decoration: underline;
}

.artist-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.artist-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  color: var(--reunion-frog-green);
  border: 2px solid var(--reunion-frog-green);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.artist-chip:hover {
  background: var(--reunion-frog-green);
  color: white;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin-top: -10px;
  margin-bottom: 10px;
  z-index: 1;
}
.footer {
  max-width: 432px;
  height: auto;
}

.paid {
  color: limegreen;
  font-weight: bold;
}

.not-paid {
  color: red;
  font-weight: bold;
}
.checked-in {
  color: orange;
  font-weight: bold;
}
.not-checked-in {
  color: orange;
  font-weight: bold;
}

/* Activity and Redemption History Styles */
.activity-section,
.redemption-section {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.history-item.check-in-item {
  border-left-color: #4caf50;
}

.history-item.check-out-item {
  border-left-color: #ff9800;
}

.history-item.redemption-item {
  border-left-color: var(--reunion-frog-green);
}

.activity-time,
.redemption-time {
  font-size: 0.85rem;
  color: #ddd;
  margin-bottom: 0.25rem;
}

.activity-details,
.redemption-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-badge,
.meal-badge {
  font-weight: bold;
  font-size: 0.9rem;
}

.action-badge.check_in {
  color: #4caf50;
}

.action-badge.check_out {
  color: #ff9800;
}

.meal-badge {
  color: var(--reunion-frog-green);
}

.operator-info {
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
}

.remaining-info {
  font-size: 0.8rem;
  color: #ddd;
}

.reason-info {
  font-size: 0.8rem;
  color: #ffeb3b;
  font-style: italic;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 10;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  color: white;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 16px;
  position: relative;
  margin-top: 2rem;
}
.festivall-emblem {
  position: absolute;
  top: 10px;
  left: 10px;
}

/* Actual close button element */
.modal-close {
  position: sticky;
  top: 15px;
  right: 20px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  z-index: 12;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  align-self: flex-end;
  margin-bottom: -30px;
}

.modal-close::before {
  content: '✕';
}

.modal-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-content h2 {
  font-size: 1.5rem;
  margin: 1rem 0;
  color: white;
}

.modal-content h3 {
  font-size: 1rem;
  line-height: 1.4;
  margin: 0.75rem 0;
}

/* Improved history list styling */
.history-list {
  max-height: 250px;
  overflow-y: auto;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.history-item {
  background: rgba(255, 255, 255, 0.08);
  margin: 0.5rem 0;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid transparent;
  font-size: 0.9rem;
}

.activity-time,
.redemption-time {
  font-size: 0.85rem;
  color: #ddd;
  margin-bottom: 0.25rem;
}

.activity-details,
.redemption-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-content button {
  width: 70%;
  max-width: 250px;
  min-height: 48px;
  border: 2px solid var(--reunion-frog-green);
  border-radius: 25px;
  padding: 0rem 1.5rem;
  background-color: var(--reunion-frog-green);
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin: 1.5rem 0 0.5rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-content button:hover {
  background-color: transparent;
  color: var(--reunion-frog-green);
}

.modal-content img {
  margin: 0 0 0.5rem 0;
}

.modal-content .qr-code {
  margin-top: 1rem;
  padding: 0;
}
</style>
