<script>
export default {
  name: 'CalltoAction'
}
</script>

<template>
  <div class="call-to-action">
    <!-- <h1 class="volunteer">
      Want to volunteer?‍<br />
      <a href="https://dasrecord.typeform.com/to/a65mFuLr">APPLY NOW</a>
    </h1> -->
    <h1 class="lineup">
      Want to know who's performing?<br />
      <RouterLink to="/reunionartists">CHECK THE LINEUP</RouterLink><br />
    </h1>
    <h1 class="tickets">
      Ready to buy tickets?‍<br />
      <a href="https://dasrecord.typeform.com/to/dyJs6iFd">BUY TICKETS</a>
    </h1>
  </div>
</template>

<style scoped>
.call-to-action {
  text-align: center;
  border: 3px solid #f0f0f0;
  border-radius: 30px;
  margin-top: 1rem;
}
h1 {
  border: 1px solid rgba(121, 188, 255, 0.25);
  padding: 1rem;
  margin: 1rem;
  box-shadow: inset 0 0 50px rgba(121, 188, 255, 0.25);
}
.volunteer,
.lineup {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.tickets {
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
</style>
