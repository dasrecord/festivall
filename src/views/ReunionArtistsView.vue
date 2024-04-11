<template>
  <div>
    <h1>Reunion 2024 Artists</h1>
    <ul>
      <li v-for="artist in artists" :key="artist.id">
        <img :src="artist.attachments[0].url" alt="artist" />
        ACT NAME {{ artist.desc.split('###')[13].split(':')[1] }}<br />
        GENRE {{ artist.desc.split('###')[14].split(':')[1] }}<br />
        BIO {{ artist.desc.split('###')[15].split(':')[1] }}<br />
      </li>
    </ul>
  </div>
</template>

<script>
import artistsData from '@/data/people&staff.json'

export default {
  data() {
    return {
      artists: []
    }
  },
  mounted() {
    this.fetchArtists()
  },
  methods: {
    fetchArtists() {
      try {
        const cards = artistsData.cards
        const filteredArtists = cards.filter((card) => card.idList === '660c7e0c2fcf9424d8c72568')
        this.artists = filteredArtists
        console.log(this.artists)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
