<script setup>
import {  RouterView } from 'vue-router'
import HeaderComponent from "@/components/HeaderComponent.vue";
import UpdateBanner from "@/components/ui/UpdateBanner.vue";
</script>
<template>
  <HeaderComponent />
  <RouterView />
  <UpdateBanner />
</template>

<style scoped>

</style>
