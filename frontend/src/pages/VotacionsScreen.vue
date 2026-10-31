<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4">Votacions</h1>
      </v-col>
    </v-row>

    <v-row v-if="connectionStatus !== 'open'">
      <v-col cols="12">
        <v-alert :type="connectionStatus === 'error' ? 'warning' : 'info'" density="compact">
          {{ statusMessage }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3" v-for="(count, idx) in store.votos" :key="idx">
        <BotoVotar :optionIndex="idx" :votesCount="count" @votar="handleVote" />
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12">
        <GraficoVotos />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import BotoVotar from '@/components/BotoVotar.vue'
import GraficoVotos from '@/components/GraficoVotos.vue'
import WebSocketService from '@/services/WebSocketService'

const store = useAppStore()
const router = useRouter()

const connectionStatus = ref('connecting')

let wsService = null

const statusMessage = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting':
      return 'Connectant amb el servidor de votacions...'
    case 'reconnecting':
      return 'S\'ha perdut la connexió. Reintentant...'
    case 'error':
      return 'No s\'ha pogut connectar amb el servidor de votacions. Reintentant automàticament...'
    default:
      return 'Connexió tancada.'
  }
})

onMounted(() => {
  if (!store.isLoggedIn) {
    router.push('/')
    return
  }

  wsService = new WebSocketService('ws://localhost:3000', {
    onVotes: (votes) => {
      store.setVotos(votes)
    },
    onStatusChange: (status) => {
      connectionStatus.value = status
    },
  })
  wsService.connect()
})

function handleVote(optionIndex) {
  if (wsService) {
    wsService.sendVote(optionIndex)
  }
}

onBeforeUnmount(() => {
  if (wsService) {
    wsService.disconnect()
    wsService = null
  }
})
</script>
