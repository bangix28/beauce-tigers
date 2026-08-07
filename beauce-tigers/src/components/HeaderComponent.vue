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
          <router-link
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="text-gray-300 hover:text-lol-gold transition-colors relative group"
              exact-active-class="text-lol-gold"
          >
            {{ item.label }}
            <span
                class="absolute -bottom-1 left-0 w-full h-0.5 bg-lol-gold transform scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100"
            />
          </router-link>
        </nav>
      </div>
    </header>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Objets et non libellés seuls : l'ancienne dérivation d'URL par
      // toLowerCase() cassait dès qu'un libellé contenait un espace ou un accent
      menuItems: [
        { label: 'Tableau de bord', to: '/' },
        { label: 'Courses', to: '/courses' }
      ],
    };
  },
};
</script>

<style scoped>
/* Ajoutez ici vos styles personnalisés */
</style>
