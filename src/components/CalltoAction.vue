<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'CalltoAction'
}
</script>

<template>
  <div class="call-to-action">
    <RouterLink to="/reuniontickets">
      <h1 class="tickets">
        <span style="color: white">Ready to buy tickets?‍</span><br />
        BUY TICKETS
      </h1>
    </RouterLink>
    <RouterLink to="/reunionapplication" class="link">
      <h1 class="volunteer">
        <span style="color: white">Looking to volunteer?‍</span><br />
        APPLY NOW
      </h1>
    </RouterLink>

    <a href="https://instagram.com/reunion_festival">
      <h1 class="">
        <span style="color: white">Need our socials‍?</span><br />
        CLICK HERE
      </h1>
    </a>

    <a href="https://share.hsforms.com/117WsKaz0SWyxu6YNh8RI4geax3l">
      <h1 class="mailing-list">
        <span style="color: white">Want to join our mailing list?</span><br />
        SIGN UP
      </h1>
    </a>
  </div>
</template>

<style scoped>
/* CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
.call-to-action {
  text-align: center;
  border: 3px solid #f0f0f0;
  border-radius: 30px;
  /* margin-top: 1rem; */
}
h1 {
  border: 1px solid rgba(121, 188, 255, 0.25);
  box-shadow: inset 0 0 50px rgba(121, 188, 255, 0.25);
  padding: 1rem;
  margin: 0.5rem;
}
/* top corners rounded */

.tickets,
.lineup {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

/* bottom corners rounded */
.mailing-list,
.contact {
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
</style>
