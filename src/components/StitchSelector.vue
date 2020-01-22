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
                    :open="[1]"
                    activatable
                    open-on-click
                    dense
                    :active.sync="selectedStitch"
                    @update:active="updateSelectedStitch"
            >
                <template v-slot:prepend="{ item }">
                    <v-icon>
                        {{ icons[item.type] }}
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
                ring: 'mdi-auto-fix',
                sc: 'mdi-plus',
                dc: 'mdi-alpha-t',
                ch: 'mdi-shape-oval-plus',
                slst: 'mdi-circle-small',
                chr: 'mdi-dots-horizontal',
            },
            stitches: [
                { id: 2, name: "Magic Ring", type: "ring", category: "start" },
                { id: 3, name: 'Row of Chain Stitches', type: "chr", category: "start" },
                { id: 4, name: 'Single Crochet', type: "sc", category: "basic" },
                { id: 5, name: 'Double Crochet', type: "dc", category: "basic" },
                { id: 6, name: 'Chain Stitch', type: "ch", category: "basic" },
                { id: 7, name: 'Slip Stitch', type: "slst", category: "basic" },
            ],
            items: [ // compute this property from items list and create unique ids
                {
                    id: 1,
                    name: 'Starters :',
                    children: [
                        { id: 2, name: "Magic Ring", type: "ring" },
                        { id: 3, name: 'Row of Chain Stitches', type: "chr" },
                    ],
                },
                {
                    id: 4,
                    name: 'Basic',
                    children: [
                        { id: 4, name: 'Single Crochet', type: "sc" },
                        { id: 5, name: 'Double Crochet', type: "dc" },
                        { id: 6, name: 'Chain Stitch', type: "ch" },
                        { id: 7, name: 'Slip Stitch', type: "slst" },
                    ],
                }
            ]
        }
    },
    methods: {
        updateSelectedStitch() {
            let stitch = this.stitches.find(obj => {
                return obj.id === this.selectedStitch[0]
            });
            console.log("selected stitch type: " + stitch.name);
            let msg = {name: 'changeStitch', stitch};
            this.$emit("sendStitch", msg)
        }
    }
}
</script>

<style scoped>

</style>