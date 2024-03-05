<template>
    <div class="image-slider">
        <img :src="images[currentImage]" alt="Slide image" />
        <button @click="previousImage">Previous</button>
        <button @click="nextImage">Next</button>
    </div>
</template>

<script>
export default {
    props: {
        images: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            currentImage: 0
        };
    },
    methods: {
        nextImage() {
            this.currentImage = (this.currentImage + 1) % this.images.length;
        },
        previousImage() {
            this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
        },
    },
};
</script>

<style scoped>
.image-slider img {
    width: 100%;
    height: auto;
}
</style>