<template>
  <div>
    <h3>
      {{ daysLeft }} d<br />{{ hoursLeft }} h<br />{{ minutesLeft }} m<br />{{
        secondsLeft
      }}
      s<br />{{ millisecondsLeft }} ms<br />LEFT UNTIL
    </h3>
  </div>
</template>

<script>
export default {
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
      const targetDate = new Date(now.getFullYear(), 7, 30) // August 30th of the current year

      let diffInMilliseconds = targetDate - now

      const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24))
      diffInMilliseconds -= days * (1000 * 60 * 60 * 24)

      const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
      diffInMilliseconds -= hours * (1000 * 60 * 60)

      const minutes = Math.floor(diffInMilliseconds / (1000 * 60))
      diffInMilliseconds -= minutes * (1000 * 60)

      const seconds = Math.floor(diffInMilliseconds / 1000)

      const milliseconds = diffInMilliseconds - seconds * 1000

      this.daysLeft = days
      this.hoursLeft = hours
      this.minutesLeft = minutes
      this.secondsLeft = seconds
      this.millisecondsLeft = milliseconds
    }
  }
}
</script>

<style scoped></style>
