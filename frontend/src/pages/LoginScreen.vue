<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5">Inici de sessió</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field v-model="username" label="Usuari" required></v-text-field>
          <v-text-field v-model="password" label="Contrasenya" type="password" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="login">Entrar</v-btn>
      </v-card-actions>
      <v-alert v-if="error" type="error" class="mt-2">
        Credencials incorrectes
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const store = useAppStore()

const username = ref('')
const password = ref('')
const error = ref(false)

function login() {
  if (username.value === 'user' && password.value === '123') {
    store.setLoginInfo({
      loggedIn: true,
      username: username.value,
      image: '',
    })
    error.value = false
    router.push('/votacions')
  } else {
    error.value = true
  }
}
</script>
