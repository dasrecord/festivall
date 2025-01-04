<template>
  <div class="dasrecord">
    <div class="section">
      <div class="background" :style="{ backgroundImage: `url(${piano})` }"></div>
      <div class="content">
        <div>
          <h1>doctor</h1>
          <p>
            physician | consultant | innovator | systems administrator<br />
            process automation specialist
          </p>
          <a href="/docs/PD_CV_2024.pdf" download class="section-link"> downloadable cv </a>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="background" :style="{ backgroundImage: `url(${headshot})` }"></div>
      <div class="content">
        <div>
          <h1>coder</h1>
          <p>
            skill is hitting a target that others cannot hit.<br />
            genius is hitting a target that others cannot see.
          </p>
          <a
            href="https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1KjYDRCbhGGFOsdqawJ5OowtHBn5JTEBEsayhtpIa23A&font=UnicaOne-Vollkorn&lang=en&initial_zoom=3&start_at_slide=75"
            class="section-link"
          >
            interactive timeline
          </a>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="background" :style="{ backgroundImage: `url(${soundcheck})` }"></div>
      <div class="content">
        <div>
          <h1>musician</h1>
          <p>
            writer | composer | performer | festival organizer<br />
            pianist | producer | dj & turntablist
          </p>
          <a href="https://festivall.webflow.io/repertoire" class="section-link"
            >artistic repertoire</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import piano from '@/assets/images/das_record/pd_piano.jpg'
import headshot from '@/assets/images/das_record/pd_headshot.jpg'
import soundcheck from '@/assets/images/das_record/pd_soundcheck.jpg'

export default {
  name: 'DasRecordView',
  data() {
    return {
      piano,
      headshot,
      soundcheck
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');

* {
  font-family: 'Cinzel', serif;
  font-style: normal;
  font-weight: 400;
  margin: 0;
}

.dasrecord {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.section {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(8px);
  z-index: 1;
}

.content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1em;
  text-align: center;
  z-index: 2;
  padding: 0.5rem;
  text-shadow: 0px 0px 10px white;
}
.content p {
  font-size: 16px;
}
.section-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: white;
  color: black;
  text-decoration: none;
  border-radius: 10px;
  text-shadow: 0px 0px 15px black;
}
.section-link:hover {
  background: black;
  color: white;
  text-shadow: 0px 0px 10px white;
}

@media (min-width: 768px) {
  .dasrecord {
    flex-direction: row;
  }
  .section {
    padding: 1rem;
  }
  .content {
    font-size: 1.5em;
    display: flex;
    flex-direction: column;
    padding-top: 110%;
    border-radius: 1rem;
  }
}
</style>
