<template>
    <v-card
            class="mx-1"
            max-width="300"
            outlined
    >
        <v-subheader>
            {{$tc('stitch',2).toUpperCase()}}
            <v-spacer></v-spacer>
            <v-btn icon @click.stop="dialog = true">
                <v-icon>mdi-information-outline</v-icon>
            </v-btn>
        </v-subheader>

        <v-switch v-model="isIncrease" :label="isIncrease ? $t('increasing') : $t('decreasing')" v-on:change="switchStitchMode"/>
        <div class="thin-border">
            <span>{{$t('layers_amount')}}</span>
            <v-row justify="space-around">
                <v-btn class="ma-2" >
                    <v-icon>mdi-layers-minus</v-icon>
                </v-btn>
                <div class="ma-2">
                    <div class="vertical-center" tabindex="0">
                        <slot>{{ layers }}</slot>
                    </div>
                    <input type="hidden" />
                </div>
                <v-btn class="ma-2">
                    <v-icon>mdi-layers-plus</v-icon>
                </v-btn>
            </v-row>
        </div>

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
                    <v-icon v-if="!item.type">
                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                    </v-icon>
                    <v-icon v-else>
                        {{ icons[item.type] }}
                    </v-icon>
                </template>
            </v-treeview>


            <v-dialog
                    v-model="dialog"
                    max-width="400"
            >
                <v-card>
                    <v-card-title class="headline">{{$t('stitch_help_card.title')}}</v-card-title>
                    <v-card-text>
                        <div class="text--primary">
                            {{$t('stitch_help_card.select_text')}}
                            <br> <br>
                            {{$t('stitch_help_card.increase_text')}}
                        </div>
                    </v-card-text>
                </v-card>
            </v-dialog>

        </div>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            dialog: false,
            name: 'StitchSelector',
            selectedStitch: [],
            icons: {
                'ch': 'mdi-shape-oval-plus',
                'sc': 'mdi-plus',
                'hdc': 'mdi-plus',
                'dc': 'mdi-alpha-t',
                'tr': 'mdi-plus',
                'dtr': 'mdi-plus',
                'slst': 'mdi-circle-small',
            },
            isIncrease: true,
            layers: 100
        }
    },
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
            let msg = {name: 'switchStitchMode', isIncrease: this.isIncrease};
            this.$emit('triggerGraph', msg);
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
    .thin-border {
        border-style: solid;
        border-color: grey;
        border-width: 1px;
        border-radius: 10px;
        padding: 10px;
    }
</style>