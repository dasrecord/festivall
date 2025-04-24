<template>
  <div class="container">
    <h1 class="title">Haven Dance Battle Tournament</h1>
    <div class="tree">
      <!-- Dynamically render all rounds -->
      <div
        v-for="(round, roundIndex) in rounds"
        :key="'round-' + roundIndex"
        class="round"
        :style="{ gridTemplateRows: `repeat(${Math.pow(2, rounds.length - 1)}, 1fr)` }"
      >
        <div
          v-for="matchIndex in Math.pow(2, rounds.length - roundIndex - 1)"
          :key="'match-' + roundIndex + '-' + matchIndex"
          class="match"
          :style="{
            gridRow: `${(matchIndex - 1) * Math.pow(2, roundIndex) + 1} / span ${Math.pow(2, roundIndex)}`
          }"
        >
          <div class="participant">
            {{
              rounds[roundIndex][matchIndex - 1]?.participant1
                ? rounds[roundIndex][matchIndex - 1].participant1.name
                : 'TBD'
            }}
          </div>
          <div class="vs" v-if="rounds[roundIndex][matchIndex - 1]?.participant2">vs</div>
          <div class="participant" v-if="rounds[roundIndex][matchIndex - 1]?.participant2">
            {{
              rounds[roundIndex][matchIndex - 1]?.participant2
                ? rounds[roundIndex][matchIndex - 1].participant2.name
                : 'TBD'
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, query, where, getDocs } from 'firebase/firestore'
import { festivall_db } from '@/firebase'

export default {
  data() {
    return {
      participants: [], // Holds fetched participants
      rounds: [] // Holds the tournament structure
    }
  },
  methods: {
    // Fetch participants from Firestore
    async fetchParticipants() {
      try {
        const q = query(collection(festivall_db, 'haven'), where('enquiry', '==', 'Battle'))
        const querySnapshot = await getDocs(q)
        this.participants = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        this.organizeTournament()
      } catch (error) {
        console.error('Error fetching participants:', error)
      }
    },
    // Organize participants into a tournament structure
    organizeTournament() {
      console.log('Participants before organizing tournament:', this.participants)
      const shuffled = [...this.participants].sort(() => Math.random() - 0.5)
      console.log('Shuffled participants:', shuffled)
      const rounds = []

      // Create the first round (initial matches)
      const firstRound = []
      for (let i = 0; i < shuffled.length; i += 2) {
        firstRound.push({
          participant1: shuffled[i],
          participant2: shuffled[i + 1] || null
        })
      }
      rounds.push(firstRound)

      // Initialize empty rounds for the rest of the tournament
      let numRounds = Math.ceil(Math.log2(this.participants.length))
      for (let i = 1; i < numRounds; i++) {
        rounds.push([]) // Add empty arrays for subsequent rounds
      }

      this.rounds = rounds
      console.log('Rounds array:', this.rounds)
    }
  },
  mounted() {
    // For testing, use a static array of participants
    this.participants = [
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'Diana' },
      { name: 'Eve' },
      { name: 'Frank' },
      { name: 'Grace' },
      { name: 'Heidi' },
      { name: 'Ivan' },
      { name: 'Judy' },
      { name: 'Karl' },
      { name: 'Leo' },
      { name: 'Mallory' },
      { name: 'Nina' },
      { name: 'Oscar' },
      { name: 'Peggy' },
      { name: 'Quentin' },
      { name: 'Rupert' },
      { name: 'Sybil' },
      { name: 'Trent' },
      { name: 'Uma' },
      { name: 'Victor' },
      { name: 'Walter' },
      { name: 'Xena' },
      { name: 'Yara' },
      { name: 'Zane' }
    ]
    this.organizeTournament()
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  text-align: center;
}
.title {
  font-size: 2rem;
  margin-bottom: 20px;
}
.tree {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 20px;
  overflow-x: auto;
  padding: 20px;
}
.round {
  display: grid;
  gap: 10px;
}
.match {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid var(--festivall-baby-blue);
  border-radius: 5px;
  padding: 10px;
}
.participant {
  font-size: 14px;
  margin: 5px 0;
}
.vs {
  font-weight: bold;
}
</style>
