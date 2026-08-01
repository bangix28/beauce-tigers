<template>
  <div
    class="flex flex-col items-center justify-center gap-1 p-3 bg-lol-darker border border-lol-gold/30 rounded"
  >
    <span class="font-beaufort text-2xl font-bold text-lol-gold">{{ value }}</span>
    <span class="text-xs uppercase tracking-widest text-gray-400 text-center">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'StatTile',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    }
  }
}
</script>
