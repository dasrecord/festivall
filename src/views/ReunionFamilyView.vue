<script>
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'
import arrow_image from '@/assets/images/arrow.jpg'
import audience_image from '@/assets/images/audience.jpg'
import costume_image from '@/assets/images/costume.jpg'
import friends_image from '@/assets/images/friends.jpg'
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
import CalltoAction from '@/components/CalltoAction.vue'

export default {
  components: {
    CarouselComponent,
    CalltoAction
  },
  data: () => ({
    slides: [
      arrow_image,
      audience_image,
      costume_image,
      friends_image,
      grooving_image,
      janicka_image,
      jordan_image,
      kevin_image,
      kids_image,
      kirk_image,
      night_image,
      perform_image,
      talk_image,
      tribal_image,
      vandamage_image
    ]
  })
}
</script>
<template>
  <div class="basic">
    <h1>THE REUNION‍</h1>
    <h2>About Our Festival</h2>
    <h3>
      The Reunion is an independent electronic music festival located just outside Saskatoon. We
      prioritize high quality local acts and support them with a cohesive and multitalented
      volunteer team. Our custom built sound system and in-house projection mapping team create a
      premium audio-visual experience for the most discerning of electronic music lovers. We are a
      family friendly event with an interest in growth, community, and sustainability.<br /><br />
    </h3>

    <CarouselComponent :slides="slides" :interval="3600" controls indicators> </CarouselComponent>
    <CalltoAction />
  </div>
</template>

<style>
.basic h2 {
  padding: 1rem;
  text-align: center;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
img {
  display: inline;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
