

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
        <input type="file" accept="application/json" ref="file" style="display: none" v-on:change="loadPattern">
        <v-btn class="ma-2" outlined color="indigo" @click="$refs.file.click()">
            <v-icon> mdi-folder-open-outline </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click="newLayer">
            <v-icon> mdi-layers-plus </v-icon>
        </v-btn>
        <v-btn class="ma-2" outlined color="indigo" @click.stop="dialog = true">
            <v-icon> mdi-new-box </v-icon>
        </v-btn>

        <v-dialog
                v-model="dialog"
                max-width="290"
                persistent
        >
            <v-card>
                <v-card-title class="headline">Start a new Pattern</v-card-title>
                <v-card-text>
                    Choose which method you want to use to start the new Pattern.
                    <v-container>
                        <v-select
                                v-model="selectedMethod"
                                :items="startMethods"
                                label="Start Method"
                                data-vv-name="select"
                        />
                        <v-text-field v-if="selectedMethod!='Magic Ring'"
                                v-model="stitchAmount"
                                :rules="[rules.number]"
                                label="Number of Stitches"
                                maxlength="3"
                        />

                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer/>

                    <v-btn
                            color="green darken-1"
                            text
                            @click="dialog = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                            color="green darken-1"
                            text
                            @click="startGraph"
                    >
                        Done
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                name: "ActionToolBar",
                dialog: false,
                startMethods: [
                    "Magic Ring",
                    "Line of Chain Stitches",
                    "Round of Chain Stitches"
                ],
                selectedMethod: "Magic Ring",
                stitchAmount: 6,
                rules: {
                    number: value => {
                        const pattern = /^[1-9][0-9]{0,2}$/;
                        return pattern.test(value) || 'Please input a whole number.'
                    },
                },
                patternFile: null
            }
        },
        methods: {
            startGraph() {
                this.dialog = false;
                let msg = {name: 'start', method: this.selectedMethod, stitchAmount: this.stitchAmount};
                this.$emit("triggerGraph", msg)
            },
            newLayer() {
                let msg = {name: 'newLayer'};
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
            },
            loadPattern() {
                let file = this.$refs.file.files[0];
                if(!file || file.type != "application/json"){
                    console.warn("No file chosen or file is not of type application/json");
                    return false;
                }
                let msg = {name: 'loadGraphFile', patternFile: file};
                this.$emit("triggerGraph", msg);
            }
        }
    }
</script>

<style scoped>

</style>