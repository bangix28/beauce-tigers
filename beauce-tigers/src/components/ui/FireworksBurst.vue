<template>
  <canvas v-if="!reducedMotion" ref="canvas" class="fireworks" aria-hidden="true"></canvas>
</template>

<script>
// Couleurs du thème LAN : orange tigre, or, nacre prismatique
const COLORS = ['#F08A24', '#F2C14E', '#FFE29A', '#FFB4A2', '#B5EAD7', '#A0C4FF']
const BURSTS = 5
const BURST_GAP_MS = 420
const PARTICLES_PER_BURST = 42
const GRAVITY = 0.045
const DRAG = 0.985
const FADE = 0.016

const random = (min, max) => min + Math.random() * (max - min)

// Quelques gerbes de feux d'artifice au-dessus du champion de la manche, puis
// plus rien : le canvas se vide seul. Purement décoratif, absent si
// l'utilisateur a demandé moins d'animations.
export default {
  name: 'FireworksBurst',
  data() {
    return {
      reducedMotion:
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    }
  },
  mounted() {
    const canvas = this.$refs.canvas
    const context = canvas?.getContext?.('2d')
    if (!context) return

    this.context = context
    this.particles = []
    this.timers = []
    this.burstsLeft = BURSTS
    this.resize()

    for (let burst = 0; burst < BURSTS; burst += 1) {
      this.timers.push(setTimeout(this.explode, burst * BURST_GAP_MS))
    }
    this.frame = requestAnimationFrame(this.tick)
  },
  beforeUnmount() {
    cancelAnimationFrame(this.frame)
    this.timers?.forEach(clearTimeout)
  },
  methods: {
    resize() {
      const canvas = this.$refs.canvas
      const ratio = window.devicePixelRatio || 1
      this.width = canvas.clientWidth
      this.height = canvas.clientHeight
      canvas.width = this.width * ratio
      canvas.height = this.height * ratio
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0)
    },
    explode() {
      this.burstsLeft -= 1
      const x = random(this.width * 0.2, this.width * 0.8)
      const y = random(this.height * 0.15, this.height * 0.5)
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      for (let i = 0; i < PARTICLES_PER_BURST; i += 1) {
        const angle = (Math.PI * 2 * i) / PARTICLES_PER_BURST
        const speed = random(1.4, 3.4)
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: Math.random() < 0.25 ? '#FFFFFF' : color
        })
      }
    },
    tick() {
      const ctx = this.context
      ctx.clearRect(0, 0, this.width, this.height)
      ctx.globalCompositeOperation = 'lighter'

      this.particles = this.particles.filter((p) => p.life > 0)
      for (const p of this.particles) {
        p.vx *= DRAG
        p.vy = p.vy * DRAG + GRAVITY
        p.x += p.vx
        p.y += p.vy
        p.life -= FADE
        ctx.globalAlpha = Math.max(p.life, 0)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.2 * p.life + 0.6, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // La boucle s'arrête quand toutes les gerbes sont parties et retombées
      if (this.burstsLeft > 0 || this.particles.length > 0) {
        this.frame = requestAnimationFrame(this.tick)
      }
    }
  }
}
</script>

<style scoped>
.fireworks {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
