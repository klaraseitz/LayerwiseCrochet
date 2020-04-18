<template>
    <div>
        <v-card
                class="mx-1"
                max-width="300"
                elevation="24"
        >
            <v-row justify="space-around" dense>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn icon color="indigo" class="ma-2" @click.stop="switchStitchMode" v-on="on">
                            <icon-base v-if="isIncrease" :width="18" :height="18" :icon-name="icons['inc']"/>
                            <icon-base v-else :width="18" :height="18" :icon-name="icons['dec']"/>
                        </v-btn>
                    </template>
                    <span v-if="isIncrease">{{$t('increasing')}}</span>
                    <span v-else>{{$t('decreasing')}}</span>
                </v-tooltip>
                <v-divider vertical />
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn icon color="indigo" class="ma-2" @click.stop="auto_complete_dialog = true" v-on="on">
                            <v-icon> mdi-auto-fix </v-icon>
                        </v-btn>
                    </template>
                    <span>{{$t('tooltips.auto_complete')}}</span>
                </v-tooltip>
                <v-divider vertical />
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn icon color="indigo" class="ma-2" @click.stop="startAddHole" :disabled="waitingForHoleSelection" v-on="on">
                            <v-icon> mdi-selection-ellipse-arrow-inside </v-icon>
                        </v-btn>
                    </template>
                    <span>{{$t('tooltips.add_hole')}}</span>
                </v-tooltip>
            </v-row>

            <v-divider/>

            <div>
                <v-row justify="space-around">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon color="indigo" class="ma-2" @click="decreaseLayers" v-on="on">
                                <v-icon>mdi-layers-minus</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltips.remove_layer')}}</span>
                    </v-tooltip>
                    <div class="ma-2">
                        <div class="vertical-center" v-bind:class="[layers % 2 === 0 ? 'red-text' : 'black-text']" tabindex="0" >
                            {{layers}}
                        </div>
                        <input type="hidden" />
                    </div>
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon color="indigo" class="ma-2" @click="increaseLayers" v-on="on">
                                <v-icon>mdi-layers-plus</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltips.add_layer')}}</span>
                    </v-tooltip>
                </v-row>
            </div>

            <v-divider></v-divider>

            <div>
                <v-treeview
                        :items="items"
                        activatable
                        open-on-click
                        dense
                        :active.sync="selectedStitch"
                        @update:active="updateSelectedStitch"
                >
                    <template v-slot:prepend="{ item, open }">
                        <v-icon color="indigo" v-if="!item.type">
                            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                        </v-icon>
                        <icon-base color="black" v-else :icon-name=icons[item.type]>
                        </icon-base>
                    </template>
                </v-treeview>
            </div>
        </v-card>

        <v-dialog
                v-model="auto_complete_dialog"
                max-width="290"
                @keydown.enter="autoComplete"
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
                        {{$t("cancel")}}
                    </v-btn>

                    <v-btn
                            color="green darken-1"
                            text
                            @click="autoComplete"
                    >
                        {{$t("done")}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
                v-model="showHoleInfoScreen"
                max-width="520"
        >
            <v-card>
                <v-card-title>
                    {{$t('hole_info.title')}}
                </v-card-title>
                <v-card-text>
                    {{$t('hole_info.how_to_select')}}
                    <br>
                    {{$t('hole_info.how_to_use_hole')}}
                </v-card-text>
                <v-checkbox v-model="showHoleInfoNeverAgain" :label="$t('dont_show_this_help_again')"></v-checkbox>


                <v-card-actions>
                    <v-spacer/>

                    <v-btn
                            color="darken-1"
                            text
                            @click="showHoleInfoScreen = false"
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-btn
                class="accept-tile"
                v-if="waitingForHoleSelection"
                color="green"
                dark
                outlined
                elevation="24"
                bottom
                fixed
                right
                fab
                tile
                @click="acceptHole"
        >
            <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn
                class="accept-tile"
                v-if="waitingForHoleSelection"
                color="red"
                dark
                outlined
                elevation="24"
                bottom
                left
                fixed
                tile
                fab
                @click="discardHole"
        >
            <v-icon>mdi-close</v-icon>
        </v-btn>
    </div>
</template>

<script>
import IconBase from "@/components/IconBase";

export default {
    data() {
        return {
            name: "CrochetActions.vue",
            auto_complete_dialog: false,
            selectedStitch: [],
            icons: {
                'ch': 'chainStitch',
                'sc': 'singleCrochet',
                'hdc': 'halfDoubleCrochet',
                'dc': 'doubleCrochet',
                'tr': 'trebleCrochet',
                'dtr': 'doubleTrebleCrochet',
                'slst': 'slipstitch',
                'inc': 'increase',
                'dec': 'decrease'
            },
            isIncrease: true,
            layers: 0,
            waitingForHoleSelection: false,
            stitchAmountAutoComplete: 1,
            numberRepetitionsAutoComplete: 5,
            showHoleInfoScreen: false,
            showHoleInfoNeverAgain: false,
            rules: {
                number: value => {
                    const pattern = /^[1-9][0-9]{0,2}$/;
                    return pattern.test(value) || 'Please input a whole number.'
                },
            },
        }
    },
    components: {
        IconBase
    },
    props: [ 'layer' ],
    methods: {
        updateSelectedStitch() {
            let stitch = this.stitches.find(obj => {
                return obj.id === this.selectedStitch[0]
            });
            let stitchName = stitch ? stitch.type : null;
            let msg = {name: 'changeStitch', stitch: stitchName};
            this.$emit("sendStitch", msg);

        },
        switchStitchMode(){
            this.isIncrease = !this.isIncrease;
            let msg = {name: 'switchStitchMode', isIncrease: this.isIncrease};
            this.$emit('triggerGraph', msg);
        },
        decreaseLayers() {
            this.layers--;
            this.updateLayer();
        },
        increaseLayers() {
            this.layers++;
            this.updateLayer();
        },
        updateLayer(){
            let msg = {name: 'setMaxLayers', layers: this.layers};
            this.$emit("triggerGraph", msg)
        },
        startAddHole() {
            this.waitingForHoleSelection = true;
            if(!this.showHoleInfoNeverAgain){
                this.showHoleInfoScreen = true;
            }
            let msg = {name: 'startAddHole'};
            this.$emit("triggerGraph", msg);
        },
        stopAddHole(shouldCreate) {
            this.waitingForHoleSelection = false;
            let msg = {name: 'stopAddHole', shouldCreate: shouldCreate};
            this.$emit("triggerGraph", msg);
        },
        acceptHole(){
            this.stopAddHole(true);
        },
        discardHole(){
            this.stopAddHole(false);
        },
        autoComplete() {
            this.auto_complete_dialog = false;
            let msg = {name: 'auto_complete',
                numStitches: this.stitchAmountAutoComplete,
                numRepetitions: this.numberRepetitionsAutoComplete};
            this.$emit("triggerGraph", msg);
        },
    },
    watch: {
        layer: function (layer) {
            this.layers = layer;
        }
    },
    computed: {
        items: function() {
            let treeData = [];
            let id = 0;
            this.stitches.forEach(stitch => {
                let categoryBranch = treeData.find(obj => {
                    return obj.name === stitch.category;
                });
                if(categoryBranch){
                    categoryBranch.children.push({id: id, name: stitch.name, type: stitch.type});
                    stitch.id = id;
                    id++;
                }else{
                    treeData.push({id: id, name: stitch.category, children: [{id: id+1, name: stitch.name, type: stitch.type}]});
                    stitch.id = id+1;
                    id += 2;
                }
            });
            return treeData;
        },
        stitches: function() {
            return [
                { name: this.$t('stitches.ch'), category: this.$t('stitch_category.basic'), type: "ch" },
                { name: this.$t('stitches.sc'), category: this.$t('stitch_category.basic'), type: "sc" },
                { name: this.$t('stitches.hdc'), category: this.$t('stitch_category.basic'), type: "hdc" },
                { name: this.$t('stitches.dc'), category: this.$t('stitch_category.basic'), type: "dc" },
                { name: this.$t('stitches.tr'), category: this.$t('stitch_category.basic'), type: "tr" },
                { name: this.$t('stitches.dtr'), category: this.$t('stitch_category.basic'), type: "dtr" },
                { name: this.$t('stitches.slst'), category: this.$t('stitch_category.ending'), type: "slst" },
            ]
        },
        numStitchesLabelAutoComplete: function() {
            return this.$t('auto_complete_card.num_stitches');
        },
        numRepetitionsLabelAutoComplete: function() {
            return this.$t('auto_complete_card.num_repetitions');
        }
    }
}
</script>

<style scoped>
    .vertical-center {
        margin: 0;
        position: relative;
        top: 50%;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }
    .accept-tile {
        margin-left: 50%;
        margin-right: 50%;
    }
    .red-text {
        color: red
    }
    .black-text {
        color: black
    }
</style>