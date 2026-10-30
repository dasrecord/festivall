<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QRCode from 'qrcode'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { useHead } from '@vueuse/head'

const campaignUrl = 'https://festivall.ca/reunion-trick-or-treat'
const qrCode = ref('')
const qrCodeError = ref('')

useHead({
  title: 'Reunion Trick or Treat — Printable Poster | Festivall',
  meta: [
    {
      name: 'description',
      content: 'Scan to claim 25% off Reunion Festival 2027 tickets and enter the ticket prize draw.'
    },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

onMounted(async () => {
  try {
    qrCode.value = await QRCode.toDataURL(campaignUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 900,
      color: { dark: '#17231d', light: '#ffffff' }
    })
  } catch (error) {
    console.error('Unable to generate the Trick or Treat poster QR code:', error)
    qrCodeError.value = 'The QR code could not be generated. Please reload this page.'
  }
})

function printPoster() {
  window.print()
}
</script>

<template>
  <main class="poster-page">
    <div class="poster-actions">
      <a href="/reunion-trick-or-treat">Back to promotion</a>
      <button type="button" @click="printPoster">Print poster</button>
    </div>

    <article class="poster" aria-labelledby="poster-title">
      <header class="poster-header">
        <span class="brand-mark" aria-hidden="true">R</span>
        <p>REUNION FESTIVAL <span>{{ REUNION_FESTIVAL.year }}</span></p>
      </header>

      <p class="poster-eyebrow">A little Halloween magic</p>
      <h1 id="poster-title">Trick or treat?<br /><span>Try a festival.</span></h1>
      <p class="poster-offer">
        Scan to get <strong>25% off Reunion {{ REUNION_FESTIVAL.year }} tickets</strong><br>
        and enter to win back what you spend.
      </p>

      <div class="qr-frame">
        <img
          v-if="qrCode"
          class="qr-code"
          :src="qrCode"
          alt="QR code linking to festivall.ca/reunion-trick-or-treat"
        />
        <p v-else-if="qrCodeError" class="qr-error" role="alert">{{ qrCodeError }}</p>
        <div v-else class="qr-loading" aria-label="Generating QR code"></div>
      </div>
      <p class="scan-label">SCAN TO CLAIM YOUR TREAT</p>
      <p class="short-url">festivall.ca/reunion-trick-or-treat</p>

      <div class="poster-perks">
        <div><strong>25% OFF</strong><span>your tickets</span></div>
        <span class="perk-divider" aria-hidden="true"></span>
        <div><strong>WIN UP TO $500</strong><span>ticket prize draw</span></div>
      </div>

      <footer>
        <p>
          Reunion Festival · September {{ REUNION_FESTIVAL.day }}–{{ REUNION_FESTIVAL.endDay }},
          {{ REUNION_FESTIVAL.year }} · Near Saskatoon, Saskatchewan
        </p>
        <p>Open to Saskatchewan residents age 18+. Skill-testing question required.</p>
      </footer>
    </article>
  </main>
</template>

<style scoped>
.poster-page {
  min-height: 100vh;
  padding: 18px;
  background: #e8e8e4;
  color: #17231d;
  font-family: inherit;
}

.poster-actions {
  display: flex;
  width: min(100%, 816px);
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 14px;
}

.poster-actions a {
  color: #405b3b;
  font-weight: 700;
  text-underline-offset: 3px;
}

.poster-actions button {
  padding: 11px 18px;
  border: 0;
  border-radius: 6px;
  background: #405b3b;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.poster {
  box-sizing: border-box;
  display: flex;
  width: min(100%, 816px);
  min-height: 1056px;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 48px 56px 38px;
  background: #fffdf8;
  text-align: center;
}

.poster-header {
  display: flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
  color: #405b3b;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 2px solid #405b3b;
  border-radius: 50%;
  font-family: Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
}

.poster-header p {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.poster-header p span {
  color: #c56c32;
}

.poster-eyebrow {
  margin: 35px 0 12px;
  color: #405b3b;
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #17231d;
  font-size: 4.25rem;
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 0.98;
}

h1 span {
  color: #c56c32;
}

.poster-offer {
  max-width: 610px;
  margin: 22px 0 24px;
  color: #3a463d;
  font-size: 1.35rem;
  line-height: 1.45;
}

.poster-offer strong {
  color: #314b32;
}

.qr-frame {
  display: grid;
  width: 440px;
  height: 440px;
  max-width: 100%;
  flex: 0 0 auto;
  place-items: center;
  border: 3px solid #17231d;
  background: white;
}

.qr-code {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.qr-loading {
  width: 45px;
  height: 45px;
  border: 4px solid #dfe5d8;
  border-top-color: #405b3b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.qr-error {
  max-width: 80%;
  color: #9c2f25;
  font-weight: 700;
}

.scan-label {
  margin: 16px 0 4px;
  color: #405b3b;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.short-url {
  margin: 0;
  color: #17231d;
  font-family: 'Courier New', monospace;
  font-size: 1.18rem;
  font-weight: 700;
}

.poster-perks {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  width: 100%;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #c9d0c3;
  border-bottom: 1px solid #c9d0c3;
}

.poster-perks div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.poster-perks strong {
  color: #405b3b;
  font-size: 1.55rem;
}

.poster-perks span:not(.perk-divider) {
  color: #5a645c;
  font-size: 0.9rem;
}

.perk-divider {
  width: 1px;
  height: 42px;
  background: #c9d0c3;
}

footer {
  margin-top: auto;
  padding-top: 22px;
  color: #576158;
  font-size: 0.77rem;
  line-height: 1.5;
}

footer p {
  margin: 3px 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .poster-page {
    padding: 10px;
  }

  .poster {
    min-height: auto;
    padding: 28px 20px;
  }

  .poster-eyebrow {
    margin-top: 32px;
    font-size: 0.72rem;
  }

  h1 {
    font-size: clamp(2.6rem, 12vw, 4.1rem);
  }

  .poster-offer {
    font-size: 1.05rem;
  }

  .qr-frame {
    width: min(80vw, 440px);
    height: min(80vw, 440px);
  }

  .poster-perks {
    gap: 18px;
  }

  .poster-perks strong {
    font-size: 1.15rem;
  }

  .short-url {
    font-size: clamp(0.82rem, 3.8vw, 1.18rem);
  }
}

@page {
  size: letter portrait;
  margin: 0;
}

@media print {
  .poster-page {
    min-height: 0;
    padding: 0;
    background: white;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .poster-actions {
    display: none;
  }

  .poster {
    width: 8.5in;
    height: 11in;
    min-height: 0;
    padding: 0.48in 0.58in 0.36in;
    break-inside: avoid;
  }

  .poster-eyebrow {
    margin-top: 0.32in;
  }

  h1 {
    font-size: 50pt;
  }

  .poster-offer {
    margin: 0.19in 0;
    font-size: 17pt;
  }

  .qr-frame {
    width: 4.25in;
    height: 4.25in;
  }

  .scan-label {
    margin-top: 0.13in;
    font-size: 15pt;
  }

  .short-url {
    font-size: 14pt;
  }

  .poster-perks {
    margin-top: 0.2in;
    padding: 0.13in 0;
  }

  footer {
    padding-top: 0.16in;
    font-size: 9pt;
  }
}
</style>
