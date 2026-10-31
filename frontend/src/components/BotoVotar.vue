<template>
  <v-card class="ma-2" elevation="2">
    <v-card-title>Opció {{ optionIndex + 1 }}</v-card-title>
    <v-card-text> Vots: {{ votesCount }} </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="votar">Votar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
const props = defineProps({
  optionIndex: {
    type: Number,
    required: true,
  },
  votesCount: {
    type: Number,
    required: true,
    default: 0,
  },
})

const emit = defineEmits(['votar'])

function votar() {
  emit('votar', props.optionIndex)
}
</script>
