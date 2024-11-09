<script>
export default {
  name: 'BlessedCoastCalltoAction'
}
</script>

<template>
  <div class="call-to-action">
    <!-- <h1 class="volunteer">
      Want to get involved?<br />
      <a href="https://dasrecord.typeform.com/to/XumI03Tm">APPLY NOW</a>
    </h1> -->
    <!-- <h1 class="lineup">
      Want to know who's performing?<br />
      <RouterLink to="">CHECK THE LINEUP</RouterLink><br />
    </h1> -->
    <h1 class="know-more">
      Want to know more about us?<br />
      <RouterLink to="/blessedcoastfamily">CLICK HERE</RouterLink>
    </h1>
    <h1 class="contact">
      Have something to say? <br />
      <a href="mailto:info@blessedcoast.ca">CONTACT US</a>
    </h1>
    <!-- <h1 class="tickets">
      Ready to buy tickets?‍<br />
      <a href="https://buy.stripe.com/dR65nkdbBdjz5Ms145">BUY TICKETS</a>
    </h1> -->
    <h1 class="tickets">
      Ready to buy tickets?‍<br />
      <a href="https://buy.stripe.com/test_6oEcPS5VedmqbyUcMM">BUY TEST TICKETS</a>
    </h1>
  </div>
</template>

<style scoped>
@import url('https://use.typekit.net/yay7cee.css');

.call-to-action {
  width: 100%;
  text-align: center;
  border: 3px solid #f0f0f0;
  border-radius: 30px;
  margin-top: 1rem;
  font-family: 'amandine', sans-serif;
  font-weight: 700;
}
.call-to-action a {
  border-radius: 10px;
}
h1 {
  border: 1px solid #79bcff40;
  padding: 0.5rem;
  margin: 0.5rem;
  box-shadow: inset 0 0 25px rgba(121, 188, 255, 0.25);
}

.know-more,
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
