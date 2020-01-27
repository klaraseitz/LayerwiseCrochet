<template>
    <v-card
            class="mx-1"
            max-width="300"
            outlined
    >
        <v-subheader>STITCHES</v-subheader>
        <div>
            <v-treeview
                    :items="items"
                    activatable
                    open-on-click
                    dense
                    :active.sync="selectedStitch"
                    @update:active="updateSelectedStitch"
            >
                <template v-slot:prepend="{ item }">
                    <v-icon>
                        {{ icons[item.name] }}
                    </v-icon>
                </template>
            </v-treeview>
        </div>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            name: 'StitchSelector',
            selectedStitch: [],
            icons: {
                'Chain Stitch': 'mdi-shape-oval-plus',
                'Single Crochet': 'mdi-plus',
                'Half Double Crochet': 'mdi-plus',
                'Double Crochet': 'mdi-alpha-t',
                'Treble Crochet': 'mdi-plus',
                'Double Treble Crochet': 'mdi-plus',
                'Slipstitch': 'mdi-circle-small',
            },
            stitches: [
                { name: 'Chain Stitch', category: "Basic" },
                { name: 'Single Crochet', category: "Basic" },
                { name: 'Half Double Crochet', category: "Basic" },
                { name: 'Double Crochet', category: "Basic" },
                { name: 'Treble Crochet', category: "Basic" },
                { name: 'Double Treble Crochet', category: "Basic" },
                { name: 'Slipstitch', category: "Ending" },
            ]
        }
    },
    methods: {
        updateSelectedStitch() {
            let stitch = this.stitches.find(obj => {
                return obj.id === this.selectedStitch[0]
            });
            let msg = {name: 'changeStitch', stitch: stitch.name};
            this.$emit("sendStitch", msg);
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
                    categoryBranch.children.push({id: id, name: stitch.name});
                    stitch.id = id;
                    id++;
                }else{
                    treeData.push({id: id, name: stitch.category, children: [{id: id+1, name: stitch.name}]});
                    stitch.id = id+1;
                    id += 2;
                }
            });
            return treeData;
        }
    }
}
</script>

<style scoped>

</style>