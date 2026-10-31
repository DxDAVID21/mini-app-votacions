<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/app'
import Chart from 'chart.js/auto'

const store = useAppStore()
const chartCanvas = ref(null)
let chartInstance = null

onMounted(() => {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Opció 1', 'Opció 2', 'Opció 3', 'Opció 4'],
        datasets: [
          {
            label: 'Vots',
            data: Array.isArray(store.votos) ? [...store.votos] : [0, 0, 0, 0],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    })
  }
})

watch(
  () => store.votos,
  (newVotos) => {
    if (chartInstance && Array.isArray(newVotos)) {
      chartInstance.data.datasets[0].data = [...newVotos]
      chartInstance.update()
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 50vh;
  width: 90vw;
  max-width: 800px;
  margin: 20px auto;
}
</style>
