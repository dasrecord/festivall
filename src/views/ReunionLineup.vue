<script>
import frogImage from '@/assets/images/frog.png'

export default {
  name: 'ReunionLineup'
}
</script>
<template>
  <div class="calendar">
    <h1>THE REUNION‍ <br /></h1>
    <br />
    <h2>Artist Lineup‍</h2>
    <iframe
      src="https://calendar.google.com/calendar/u/0/embed?src=9db12edae9241ff09fe1e3dbae812dbbc65aeadee93cdcac57521f6f88c27c96@group.calendar.google.com&ctz=Regina&dates=20240830/20240902&mode=agenda&wkst=6"
      width="100%"
      height="600"
    ></iframe>
  </div>
</template>

<style>
.calendar {
  display: flex;
  flex-direction: column;
  text-align:
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
