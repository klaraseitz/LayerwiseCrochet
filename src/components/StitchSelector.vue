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
            icons: {
                ring: 'mdi-auto-fix',
                sc: 'mdi-plus',
                dc: 'mdi-alpha-t',
                ch: 'mdi-shape-oval-plus',
                slst: 'mdi-circle-small',
                chr: 'mdi-dots-horizontal',
            },
            items: [
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
    }
}
</script>

<style scoped>

</style>