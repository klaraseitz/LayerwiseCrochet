<template>
  <div id="app">
    <PatternEditor/>
  </div>
</template>

<script>
  import PatternEditor from "@/components/PatternEditor";

  export default {
    name: 'app',
    components: {
      PatternEditor
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
