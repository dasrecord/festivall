<script>
import fuse_image from '@/assets/images/fuse_collective/fuse_collective.jpg'

export default {
  components: {},
  data() {
    return {
      fuse_image: fuse_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <h1>
      FUSE COLLECTIVE <br />
      <img class="fuse" :src="fuse_image" alt="fuse" :style="{ height: '150px', width: '150px' }" />
      <br />
    </h1>
    <h2 class="description">Fuse Collective is a group of artists, musicians, producers, DJ's, production specialists, and
      promoters<br />
      all coming together to create and support new growth in the scene.</h2>
    <iframe
      width="100%"
      height="450"
      scrolling="no"
      frameborder="no"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/68926512&color=%23000000&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
    ></iframe>
    <div
      style="
        font-size: 10px;
        color: #cccccc;
        line-break: anywhere;
        word-break: normal;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family:
          Interstate,
          Lucida Grande,
          Lucida Sans Unicode,
          Lucida Sans,
          Garuda,
          Verdana,
          Tahoma,
          sans-serif;
        font-weight: 100;
      "
    >
      <a
        href="https://soundcloud.com/fusecollective"
        title="FUSE COLLECTIVE"
        target="_blank"
        style="color: #cccccc; text-decoration: none"
        >FUSE COLLECTIVE</a
      >
      ·
      <a
        href="https://soundcloud.com/fusecollective/lifted2012finale"
        title='FuseCollective.ca :: "Lifted" Loft Sessions 4 :: W/ EMILIO DEL CANTO Live @ Lydias Loft :: 11.24.&#x27;12'
        target="_blank"
        style="color: #cccccc; text-decoration: none"
        >FuseCollective.ca :: &quot;Lifted&quot; Loft Sessions 4 :: W/ EMILIO DEL CANTO Live @
        Lydias Loft :: 11.24.&#x27;12</a
      >
    </div>
  </div>
  <CalltoAction />
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

a {
  display: inline-block;
  padding: 0.5rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: box-shadow 0.4s ease-in-out;
}
a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    justify-items: flex-start;
    align-items: center;
  }
  .fuse {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
