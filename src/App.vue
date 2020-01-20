<template>
  <div id="app">
    <GraphCanvas/>
  </div>
</template>

<script>
import GraphCanvas from "@/components/GraphCanvas";

export default {
  name: 'app',
  components: {
    GraphCanvas
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
