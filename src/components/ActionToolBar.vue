

<template>
    <div>
        <v-btn class="ma-2" outlined color="indigo">
            <v-icon> mdi-undo </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo">
            <v-icon> mdi-redo </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo">
            <v-icon> mdi-content-save-outline </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo">
            <v-icon> mdi-folder-open-outline </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo">
            <v-icon> mdi-layers-plus </v-icon>
        </v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                name: "ActionToolBar"
            }
        }

    }
</script>

<style scoped>

</style>