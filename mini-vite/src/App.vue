<template>
  <h1>{{ msg }}</h1>
</template>

<script>
import { reactive, toRefs } from 'vue'
import _ from 'lodash'

export default {
  setup() {
    const state = reactive({
      msg: _.join(['mini', 'vite'], '-')
    })

    return {
      ...toRefs(state)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
