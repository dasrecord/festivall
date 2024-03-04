<!-- eslint-disable vue/valid-template-root -->
<template>
    <!-- This component doesn't need to render anything -->
</template>

<script lang="ts">
export default {
    props: {
        url: {
            type: String,
            required: true
        }
    },
    created() {
        window.location.href = this.url;
    }
}
</script>