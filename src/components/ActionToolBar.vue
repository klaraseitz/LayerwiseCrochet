

<template>
    <div>
        <v-row justify="center">
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click="undo" v-on="on">
                    <v-icon> mdi-undo </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.undo')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click="redo" v-on="on">
                    <v-icon> mdi-redo </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.redo')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click="saveGraph" v-on="on">
                    <v-icon> mdi-content-save-outline </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.save')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <input type="file" accept="application/json" ref="file" style="display: none" v-on:change="loadPattern" v-on="on">
                <v-btn class="ma-2" outlined color="indigo" @click="$refs.file.click()" v-on="on">
                    <v-icon> mdi-folder-open-outline </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.open')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click="newLayer" v-on="on">
                    <v-icon> mdi-layers-plus </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.add_layer')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click.stop="dialog = true" v-on="on">
                    <v-icon> mdi-new-box </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.new_pattern')}}</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn class="ma-2" outlined color="indigo" @click.stop="auto_complete_dialog = true" v-on="on">
                    <v-icon> mdi-auto-fix </v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.auto_complete')}}</span>
        </v-tooltip>
        <v-switch v-model="is3D" :label="is3D ? '3D' : '2D'" v-on:change="switchDimension"/>
        </v-row>

        <v-dialog
                v-model="dialog"
                max-width="290"
                persistent
        >
            <v-card>
                <v-card-title class="headline">{{$t('start_pattern_card.title')}}</v-card-title>
                <v-card-text>
                    {{$t('start_pattern_card.text')}}
                    <v-container>
                        <v-select
                                v-model="selectedMethod"
                                :items="startMethods"
                                v-bind:label="methodsLabel"
                                data-vv-name="select"
                        >
                            <template v-slot:selection="{ item }">
                                {{$t("start_methods."+item)}}
                            </template>
                            <template v-slot:item="{ item }">
                                {{$t("start_methods."+item)}}
                            </template>
                        </v-select>

                        <v-text-field v-if="selectedMethod != 'mr' && selectedMethod != '' "
                                v-model="stitchAmount"
                                :rules="[rules.number]"
                                v-bind:label="numStitchesLabel"
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
        <v-dialog
                v-model="auto_complete_dialog"
                max-width="290"
                persistent
        >
            <v-card>
                <v-card-title class="headline">{{$t('auto_complete_card.title')}}</v-card-title>
                <v-card-text>
                    {{$t('auto_complete_card.text')}}
                    <v-container>
                        <v-text-field
                                v-model="stitchAmountAutoComplete"
                                :rules="[rules.number]"
                                v-bind:label="numStitchesLabelAutoComplete"
                                maxlength="3"
                        />
                        <v-text-field
                                v-model="numberRepetitionsAutoComplete"
                                :rules="[rules.number]"
                                v-bind:label="numRepetitionsLabelAutoComplete"
                                maxlength="3"
                        />
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer/>

                    <v-btn
                            color="green darken-1"
                            text
                            @click="auto_complete_dialog = false"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                            color="green darken-1"
                            text
                            @click="autoComplete"
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
                auto_complete_dialog: false,
                stitchAmount: 6,
                stitchAmountAutoComplete: 1,
                numberRepetitionsAutoComplete: 5,
                startMethods: ["mr", "line_of_ch", "round_of_ch" ],
                selectedMethod: "mr",
                rules: {
                    number: value => {
                        const pattern = /^[1-9][0-9]{0,2}$/;
                        return pattern.test(value) || 'Please input a whole number.'
                    },
                },
                patternFile: null,
                is3D: true,
            }
        },
        computed: {
            methodsLabel: function() {
                return this.$t('start_pattern_card.method_label');
            },
            numStitchesLabel: function() {
                return this.$t('start_pattern_card.num_stitches_label');
            },
            numStitchesLabelAutoComplete: function() {
                return this.$t('auto_complete_card.num_stitches');
            },
            numRepetitionsLabelAutoComplete: function() {
                return this.$t('auto_complete_card.num_repetitions');
            }
        },
        methods: {
            startGraph() {
                this.dialog = false;
                let msg = {name: 'start',
                    method: this.selectedMethod,
                    stitchAmount: this.stitchAmount};
                this.$emit("triggerGraph", msg)
            },
            autoComplete() {
              this.auto_complete_dialog = false;
              let msg = {name: 'auto_complete',
                  numStitches: this.stitchAmountAutoComplete,
                  numRepetitions: this.numberRepetitionsAutoComplete}
              this.$emit("triggerGraph", msg);
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
                this.$refs.file.value = ''; // resets chosen file so that same file can be opened twice after another
            },
            switchDimension() {
                this.$emit("switchDimension",this.is3D);
            }
        }
    }
</script>

<style scoped>

</style>