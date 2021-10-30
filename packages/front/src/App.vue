<template>
  <v-app>
    <v-app-bar app>
      JC-Lab Web Project
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <v-footer app>
    </v-footer>
  </v-app>
</template>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
<script lang="ts">
import {
  Component,
  Vue,
} from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class App extends Vue {

}
</script>
