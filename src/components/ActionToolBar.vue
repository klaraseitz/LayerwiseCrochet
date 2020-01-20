

<template>
    <div>
        <v-btn class="ma-2" outlined color="indigo">undo</v-btn>
        <v-btn class="ma-2" outlined color="indigo">redo</v-btn>
        <v-btn class="ma-2" outlined color="indigo">save</v-btn>
        <v-btn class="ma-2" outlined color="indigo">open</v-btn>
        <v-btn class="ma-2" outlined color="indigo">new layer</v-btn>
    </div>
</template>

<script>
    import { mdiUndo } from '@mdi/js';
    export default {
        name: "ActionToolBar"
    }
</script>

<style scoped>

</style>