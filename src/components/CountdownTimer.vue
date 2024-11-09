<template>
  <div class="countdowntimer">
    <div class="unit">{{ daysLeft }}</div>
    <div>&nbsp;d</div>
    <div class="unit">{{ hoursLeft }}</div>
    <div>h</div>
    <div class="unit">{{ minutesLeft }}</div>
    <div>m</div>
    <div class="unit">{{ secondsLeft }}</div>
    <div>s</div>
    <div class="unit">{{ millisecondsLeft }}</div>
    <div>&nbsp;ms</div>

    <div>&nbsp;&nbsp;&nbsp;UNTIL</div>
  </div>
</template>

<script>
export default {
  props: {
    targetYear: {
      type: Number,
      required: true
    },
    targetMonth: {
      type: Number,
      required: true
    },
    targetDay: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      daysLeft: 0,
      hoursLeft: 0,
      minutesLeft: 0,
      secondsLeft: 0,
      millisecondsLeft: 0
    }
  },
  mounted() {
    this.updateCountdown()
    setInterval(this.updateCountdown)
  },
  methods: {
    updateCountdown() {
      const now = new Date()
      const targetDate = new Date(this.targetYear, this.targetMonth - 1, this.targetDay) // Use props for target date

      let diffInMilliseconds = targetDate - now

      const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24))
      diffInMilliseconds -= days * (1000 * 60 * 60 * 24)

      const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
      diffInMilliseconds -= hours * (1000 * 60 * 60)

      const minutes = Math.floor(diffInMilliseconds / (1000 * 60))
      diffInMilliseconds -= minutes * (1000 * 60)

      const seconds = Math.floor(diffInMilliseconds / 1000)
      diffInMilliseconds -= seconds * 1000

      let milliseconds = diffInMilliseconds.toString()
      milliseconds = milliseconds.padStart(3, '0')

      this.daysLeft = days
      this.hoursLeft = hours
      this.minutesLeft = minutes
      this.secondsLeft = seconds
      this.millisecondsLeft = milliseconds
    }
  }
}
</script>
<style scoped>
.countdowntimer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  border: 1px solid rgba(121, 188, 255, 0.25);
  box-shadow: inset 0 0 20px rgba(121, 188, 255, 0.25);
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 20px;
}

.countdowntimer .unit {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  width: 20px;
  justify-content: center;
}
</style>
