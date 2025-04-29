<template>
  <div class="container">
    <img class="haven-emblem" :src="haven_emblem" alt="Haven Emblem" />
    <h1 class="title">Dance Battle</h1>
    <p v-if="isUserLoggedIn" class="admin-notice">
      You are logged in as an admin and can select winners
    </p>
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
          <button
            v-if="isUserLoggedIn && canSelectWinner(roundIndex, matchIndex - 1)"
            @click="selectWinner(roundIndex, matchIndex - 1, 'participant1')"
            class="select-winner-btn"
          >
            <div
              class="participant"
              :class="{ winner: isWinner(roundIndex, matchIndex - 1, 'participant1') }"
            >
              {{
                rounds[roundIndex][matchIndex - 1]?.participant1
                  ? rounds[roundIndex][matchIndex - 1].participant1.fullname
                  : 'TBD'
              }}
            </div>
          </button>
          <div
            v-else
            class="participant"
            :class="{ winner: isWinner(roundIndex, matchIndex - 1, 'participant1') }"
          >
            {{
              rounds[roundIndex][matchIndex - 1]?.participant1
                ? rounds[roundIndex][matchIndex - 1].participant1.fullname
                : 'TBD'
            }}
          </div>
          <div class="vs" v-if="rounds[roundIndex][matchIndex - 1]?.participant2">vs</div>
          <button
            v-if="isUserLoggedIn && canSelectWinner(roundIndex, matchIndex - 1)"
            @click="selectWinner(roundIndex, matchIndex - 1, 'participant2')"
            class="select-winner-btn"
          >
            <div
              class="participant"
              v-if="rounds[roundIndex][matchIndex - 1]?.participant2"
              :class="{ winner: isWinner(roundIndex, matchIndex - 1, 'participant2') }"
            >
              {{
                rounds[roundIndex][matchIndex - 1]?.participant2
                  ? rounds[roundIndex][matchIndex - 1].participant2.fullname
                  : 'TBD'
              }}
            </div>
          </button>
          <div
            v-else-if="rounds[roundIndex][matchIndex - 1]?.participant2"
            class="participant"
            :class="{ winner: isWinner(roundIndex, matchIndex - 1, 'participant2') }"
          >
            {{
              rounds[roundIndex][matchIndex - 1]?.participant2
                ? rounds[roundIndex][matchIndex - 1].participant2.fullname
                : 'TBD'
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { festivall_db } from '@/firebase'
import haven_emblem from '@/assets/images/haven_emblem_white.png'

export default {
  data() {
    return {
      haven_emblem,
      participants: [], // Holds fetched participants
      rounds: [], // Holds the tournament structure
      isUserLoggedIn: false, // Tracks if the user is logged in
      currentUser: null
    }
  },
  methods: {
    // Check if user is logged in
    checkLoginStatus() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          this.currentUser = JSON.parse(userStr)
          this.isUserLoggedIn = true
          console.log('User is logged in:', this.currentUser.email)
        }
      } catch (error) {
        console.error('Error checking login status:', error)
        this.isUserLoggedIn = false
      }
    },

    // Fetch participants from Firestore
    async fetchParticipants() {
      // Always use test data in development mode
      if (import.meta.env.MODE === 'development') {
        console.log('Development mode detected - using test data instead of Firestore')
        this.useTestData()
        return
      }

      try {
        const q = query(collection(festivall_db, 'haven'), where('enquiry', '==', 'Battle'))
        const querySnapshot = await getDocs(q)

        // Log the actual data coming from Firestore
        console.log(
          'Raw data from Firestore:',
          querySnapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
        )

        this.participants = querySnapshot.docs.map((doc) => {
          // Ensure we have consistent naming
          const data = doc.data()
          return {
            id: doc.id,
            fullname: data.fullname || data.name || doc.id.split('@')[0] || 'Unnamed Dancer',
            ...data,
            records: data.records || []
          }
        })

        if (this.participants.length < 4) {
          console.warn('Not enough participants found in Firestore, using test data')
          this.useTestData()
        } else {
          console.log('Found participants:', this.participants)
          this.organizeTournament()
        }
      } catch (error) {
        console.error('Error fetching participants:', error)
        this.useTestData()
      }
    },

    // Use test data if no participants found
    useTestData() {
      this.participants = [
        { id: 'test1', fullname: 'Alice', records: [] },
        { id: 'test2', fullname: 'Bob', records: [] },
        { id: 'test3', fullname: 'Charlie', records: [] },
        { id: 'test4', fullname: 'Diana', records: [] },
        { id: 'test5', fullname: 'Eve', records: [] },
        { id: 'test6', fullname: 'Frank', records: [] },
        { id: 'test7', fullname: 'Grace', records: [] },
        { id: 'test8', fullname: 'Heidi', records: [] }
      ]
      console.log('Using test data with', this.participants.length, 'participants')
      this.organizeTournament()
    },

    // Organize participants into a tournament structure
    organizeTournament() {
      console.log('Participants before organizing tournament:', this.participants)

      // Ensure we have participants to work with
      if (!this.participants || this.participants.length === 0) {
        console.error('No participants to organize')
        return
      }

      const shuffled = [...this.participants].sort(() => Math.random() - 0.5)
      console.log('Shuffled participants:', shuffled)
      const rounds = []

      // Create the first round (initial matches)
      const firstRound = []
      for (let i = 0; i < shuffled.length; i += 2) {
        firstRound.push({
          participant1: shuffled[i],
          participant2: i + 1 < shuffled.length ? shuffled[i + 1] : null,
          winner: null
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
    },

    // Check if a participant is a winner
    isWinner(roundIndex, matchIndex, participantKey) {
      if (!this.rounds[roundIndex] || !this.rounds[roundIndex][matchIndex]) return false
      const match = this.rounds[roundIndex][matchIndex]
      return match.winner === participantKey
    },

    // Check if a winner can be selected (both participants exist)
    canSelectWinner(roundIndex, matchIndex) {
      if (!this.rounds[roundIndex] || !this.rounds[roundIndex][matchIndex]) return false
      const match = this.rounds[roundIndex][matchIndex]
      return match.participant1 && match.participant2 && !match.winner
    },

    // Select a winner for a match
    async selectWinner(roundIndex, matchIndex, participantKey) {
      console.log(
        `Selecting winner: round ${roundIndex}, match ${matchIndex}, participant ${participantKey}`
      )

      if (!this.isUserLoggedIn) {
        alert('You must be logged in to select a winner.')
        return
      }

      if (!this.rounds[roundIndex] || !this.rounds[roundIndex][matchIndex]) {
        console.error('Match does not exist:', roundIndex, matchIndex)
        return
      }

      const match = this.rounds[roundIndex][matchIndex]
      if (!match[participantKey]) {
        alert('Invalid selection: Participant does not exist.')
        return
      }

      try {
        // Make a deep copy of the rounds array to ensure reactivity
        const updatedRounds = JSON.parse(JSON.stringify(this.rounds))

        // Mark the winner in the current match
        updatedRounds[roundIndex][matchIndex].winner = participantKey
        const winner = match[participantKey]
        const loser = participantKey === 'participant1' ? match.participant2 : match.participant1

        console.log('Winner selected:', winner.fullname || winner.name)

        // Try to update Firestore, but don't fail if it errors
        try {
          if (winner.id && !winner.id.startsWith('test')) {
            console.log(`Updating winner record in Firestore for ID: ${winner.id}`)
            const winnerDocRef = doc(festivall_db, 'haven', winner.id)
            await updateDoc(winnerDocRef, {
              records: arrayUnion('w')
            })
            console.log('Winner record updated successfully')
          } else {
            console.log('Using test data - skipping Firestore update for winner')
            // Just update local data
            if (!winner.records) winner.records = []
            winner.records.push('w')
          }

          if (loser && loser.id && !loser.id.startsWith('test')) {
            console.log(`Updating loser record in Firestore for ID: ${loser.id}`)
            const loserDocRef = doc(festivall_db, 'haven', loser.id)
            await updateDoc(loserDocRef, {
              records: arrayUnion('l')
            })
            console.log('Loser record updated successfully')
          } else if (loser) {
            console.log('Using test data - skipping Firestore update for loser')
            // Just update local data
            if (!loser.records) loser.records = []
            loser.records.push('l')
          }
        } catch (firestoreError) {
          console.error('Error updating Firestore (continuing anyway):', firestoreError)
        }

        // Advance the winner to the next round
        if (roundIndex + 1 < updatedRounds.length) {
          const nextRound = updatedRounds[roundIndex + 1]
          const nextMatchIndex = Math.floor(matchIndex / 2)

          // Create the next match if it doesn't exist
          if (!nextRound[nextMatchIndex]) {
            nextRound[nextMatchIndex] = {
              participant1: null,
              participant2: null,
              winner: null
            }
          }

          // Add the winner to the appropriate position in the next match
          if (matchIndex % 2 === 0) {
            nextRound[nextMatchIndex].participant1 = JSON.parse(JSON.stringify(winner))
          } else {
            nextRound[nextMatchIndex].participant2 = JSON.parse(JSON.stringify(winner))
          }

          console.log(
            `Advanced ${winner.fullname || winner.name} to round ${roundIndex + 1}, match ${nextMatchIndex}`
          )
        } else {
          console.log(`${winner.fullname || winner.name} is the tournament champion!`)
        }

        // Update the rounds array with our modified copy to ensure reactivity
        this.rounds = updatedRounds
        console.log('Updated tournament state:', JSON.stringify(this.rounds))
      } catch (error) {
        console.error('Error selecting winner:', error)
        alert('Failed to update the winner. Please try again.')
      }
    }
  },
  mounted() {
    console.log('HavenBattleView mounted')
    this.checkLoginStatus()
    this.fetchParticipants()

    // For debugging - log the rounds structure periodically
    setTimeout(() => {
      console.log('Current tournament state:', this.rounds)
    }, 2000)
  }
}
</script>

<style scoped>
.container {
  width: 100vw;
  padding: 20px;
  text-align: center;
}
.haven-emblem {
  max-width: 300px;
  height: auto;
  margin-bottom: 20px;
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
  width: 100%;
  padding: 5px;
}
.vs {
  font-weight: bold;
}
.winner {
  background-color: rgba(var(--festivall-baby-blue-rgb), 0.2);
  font-weight: bold;
}
.select-winner-btn {
  margin-top: 5px;
  padding: 2px 6px;
  font-size: 12px;
  background-color: var(--festivall-baby-blue);
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.admin-notice {
  margin-bottom: 10px;
  font-style: italic;
  color: var(--festivall-baby-blue);
}
</style>
