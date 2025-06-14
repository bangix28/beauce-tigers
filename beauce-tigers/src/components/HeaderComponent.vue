<template>
  <div>
    <header
        class="bg-lol-darker py-4 border-b border-gray-800 sticky top-0 z-50"
    >
      <div class="container mx-auto px-4 flex items-center justify-between">
        <div
            class="flex items-center space-x-4"
        >
          <img src="@/assets/img/logo_header.svg" class="img-fluid img-thumbnail" style="width: 15%;" alt="">
          <h1 class="text-2xl font-bold text-lol-gold">Beauce Tigers Leaderboard</h1>
        </div>
        <nav class="space-x-4">
          <a
              v-for="(item, index) in menuItems"
              :key="item"
              :href="item === 'Tableau de bord' ? '/' : '/' + item.toLowerCase()"
              class="text-gray-300 hover:text-lol-gold transition-colors relative group"
          >
            {{ item }}
            <span
                class="absolute bottom-0 left-0 w-full h-0.5 bg-lol-gold transform scale-x-0 origin-left"
            />
          </a>
        </nav>
      </div>
    </header>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuItems: ['Tableau de bord', 'Comparer', 'Paramètres'],
    };
  },
};
</script>

<style scoped>
/* Ajoutez ici vos styles personnalisés */
</style>
