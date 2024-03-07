<template>
    <div class="team-card">
        <slot name="headshot">
            <!-- Default content for headshot -->
        </slot>
        <slot name="name">
            <!-- Default content for name -->
        </slot>
        <slot name="role">
            <!-- Default content for role -->
        </slot>
    </div>
</template>

<script>
export default {
    name: 'TeamCard'
}
</script>

<style scoped>
.team-card {
    /* Add your styles here */
}

</style>