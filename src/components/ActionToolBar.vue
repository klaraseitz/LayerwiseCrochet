

<template>
    <div>
        <v-btn class="ma-2" outlined color="indigo" @click="undo">
            <v-icon> mdi-undo </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="redo">
            <v-icon> mdi-redo </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="saveGraph">
            <v-icon> mdi-content-save-outline </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="openGraph">
            <v-icon> mdi-folder-open-outline </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="newLayer">
            <v-icon> mdi-layers-plus </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="resetGraph">
            <v-icon> mdi-new-box </v-icon>
        </v-btn>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                name: "ActionToolBar"
            }
        },
        methods: {
            resetGraph() {
                let msg = {name: 'reset'};
                this.$emit("triggerGraph", msg)
            },
            startGraph() {
                let msg = {name: 'start', data: 'magicRing'};
                this.$emit("triggerGraph", msg)
            },
            newLayer() {
                let msg = {name: 'newLayer'};
                this.$emit("triggerGraph", msg)
            },
            openGraph() {
                let msg = {name: 'openGraph'};
                this.$emit("triggerGraph", msg)
            },
            saveGraph() {
                let msg = {name: 'saveGraph'};
                this.$emit("triggerGraph", msg)
            },
            redo() {
                let msg = {name: 'redo'};
                this.$emit("triggerGraph", msg)
            },
            undo() {
                let msg = {name: 'undo'};
                this.$emit("triggerGraph", msg)
            }
        }
    }
</script>

<style scoped>

</style>