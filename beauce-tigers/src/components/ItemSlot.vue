<template>
  <HextechTooltip :title="itemInfo?.name" :meta="priceLabel" :description="itemInfo?.description">
    <span
      class="block w-12 h-12 border border-lol-gold/50 bg-lol-darker rounded-sm overflow-hidden"
      :class="{ 'empty-slot': isEmpty }"
    >
      <img
        v-if="iconUrl != null"
        :src="iconUrl"
        :alt="itemInfo?.name ?? `Item ${itemId}`"
        class="w-full h-full object-cover"
      />
    </span>
  </HextechTooltip>
</template>

<script>
import { useAssetCatalogStore } from '@/stores/assetCatalogStore'
import HextechTooltip from '@/components/HextechTooltip.vue'

export default {
  name: 'ItemSlot',
  components: { HextechTooltip },
  props: {
    // null = slot vide
    itemId: {
      type: Number,
      default: null
    }
  },
  created() {
    this.assetStore = useAssetCatalogStore()
  },
  computed: {
    iconUrl() {
      return this.assetStore.getItemIconUrl(this.itemId)
    },
    isEmpty() {
      return this.itemId == null || this.iconUrl == null
    },
    itemInfo() {
      return this.assetStore.getItemInfo(this.itemId)
    },
    priceLabel() {
      if (!this.itemInfo || this.itemInfo.priceTotal <= 0) return null
      return `${this.itemInfo.priceTotal} PO`
    }
  }
}
</script>

<style scoped>
/* Slot d'item vide : motif diagonal subtil */
.empty-slot {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(200, 170, 110, 0.06) 4px,
    rgba(200, 170, 110, 0.06) 8px
  );
}
</style>
