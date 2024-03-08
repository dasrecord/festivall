<script>
import ImageSlider from '@/components/ImageSlider.vue'
import arrow_image from '@/assets/images/arrow.jpg'
import audience_image from '@/assets/images/audience.jpg'
import costume_image from '@/assets/images/costume.jpg'
import friends_image from '@/assets/images/friends.jpg'
import frog_image from '@/assets/images/frog.png'
import grooving_image from '@/assets/images/grooving.jpg'
import janicka_image from '@/assets/images/janicka.jpg'
import jordan_image from '@/assets/images/jordan.jpg'
import kevin_image from '@/assets/images/kevin.jpg'
import kids_image from '@/assets/images/kids.jpg'
import kirk_image from '@/assets/images/kirk.jpg'
import night_image from '@/assets/images/night.jpg'
import perform_image from '@/assets/images/perform.jpg'
import talk_image from '@/assets/images/talk.jpg'
import tribal_image from '@/assets/images/tribal.jpg'
import vandamage_image from '@/assets/images/vandamage.jpg'

export default {
  components: {
    ImageSlider
  },
  data() {
    return {
      arrowImage: arrow_image,
      audienceImage: audience_image,
      costumeImage: costume_image,
      friendsImage: friends_image,
      frogImage: frog_image,
      groovingImage: grooving_image,
      janickaImage: janicka_image,
      jordanImage: jordan_image,
      kevinImage: kevin_image,
      kidsImage: kids_image,
      kirkImage: kirk_image,
      nightImage: night_image,
      performImage: perform_image,
      talkImage: talk_image,
      tribalImage: tribal_image,
      vandamageImage: vandamage_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>THE REUNION‍ <br /></h1>
    <h2>
      Our festival is a vibrant celebration of culture and community. It brings together people from
      all walks of life to enjoy music, art, food, and more. We believe in the power of shared
      experiences to create lasting memories and build strong bonds. Join us for a weekend of fun,
      laughter, and connection.<br /><br />
    </h2>

    <ImageSlider
      :images="[
        groovingImage,
        nightImage,
        tribalImage,
        vandamageImage,
        janickaImage,
        jordanImage,
        kevinImage,
        kidsImage,
        friendsImage,
        costumeImage,
        performImage,
        talkImage,
        kirkImage,
        audienceImage
      ]"
    >
    </ImageSlider>
    <h1>
      Want to perform or volunteer?‍<br />
      <a href="https://dasrecord.typeform.com/to/a65mFuLr">APPLY NOW</a>
    </h1>
    <h1>
      Ready to buy tickets?‍<br />
      <a href="https://dasrecord.typeform.com/to/dyJs6iFd">BUY TICKETS</a>
    </h1>
  </div>
</template>

<style>
.basic {
  padding: 2rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
img {
  display: inline;
  max-width: 500px;
  height: auto;
  border-radius: 25px;
}

@media (min-width: 1024px) {
  .basic {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
