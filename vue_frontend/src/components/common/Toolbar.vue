<template>
  <div>
    <v-toolbar class="toolbar">
      <v-toolbar-items>
        <v-btn flat>
          <v-img :src="logo"></v-img>
        </v-btn>
      </v-toolbar-items>

      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn :to="{ name: 'sign_in' }" exact flat>Sign in</v-btn>
        <v-btn :to="{ name: 'sign_up' }" flat>Sign up</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <router-view></router-view>
  </div>
</template>

<script>
  import { FileResources } from '@/common/constants'

  export default {
    data() {
      return {
        logo: FileResources.logo
      }
    }
  }
</script>
