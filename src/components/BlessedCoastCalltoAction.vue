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
      Want to get involved?<br />
      <RouterLink to="#">APPLICATIONS COMING SOON</RouterLink>
    </h1>
    <h1 class="contact">
      Have something to say? <br />
      <a href="mailto:info@blessedcoast.ca">CONTACT US</a>
    </h1>
    <!-- <h1 class="tickets">
      Ready to buy tickets?‍<br />
      <a href="">BUY TICKETS</a>
    </h1> -->
  </div>
</template>

<style scoped>
/* Light BG #d1c8f4 Dark BG: #ae9def Dark Font: #531a4a80 Light Font: #531a4a */
@import url('https://use.typekit.net/yay7cee.css');

.call-to-action {
  width: 100%;
  text-align: center;
  border: 3px solid #531a4a;
  border-radius: 30px;
  margin-top: 1rem;
  font-family: 'amandine', sans-serif;
  font-size: 1rem;
  font-weight: 700;
}
.call-to-action a {
  color: #531a4a;
  border-radius: 10px;
  font-weight: 700;
}
.call-to-action a:hover {
  background-color: #531a4a;
  color: #d1c8f4;
}
h1 {
  border: 1px solid #531a4a80;
  padding: 0.5rem;
  margin: 0.5rem;
  box-shadow: inset 0 0 25px #531a4a;
}

.know-more,
.volunteer,
.lineup {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.tickets,
.contact {
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
</style>
