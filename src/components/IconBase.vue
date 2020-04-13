<template>
    <svg xmlns="http://www.w3.org/2000/svg"
         :width="width"
         :height="height"
         viewBox="0 0 18 18"
         :aria-labelledby="iconName"
         role="presentation"
    >

    <g :fill="iconColor">
        <icon-chain-stitch v-if="iconName === 'chainStitch'"/>
        <icon-double-crochet v-else-if="iconName === 'doubleCrochet'"/>
        <icon-double-treble-crochet v-else-if="iconName === 'doubleTrebleCrochet'"/>
        <icon-half-double-crochet v-else-if="iconName === 'halfDoubleCrochet'"/>
        <icon-single-crochet v-else-if="iconName === 'singleCrochet'"/>
        <icon-slipstitch v-else-if="iconName === 'slipstitch'"/>
        <icon-treble-crochet v-else-if="iconName === 'trebleCrochet'"/>
    </g>
  </svg>
</template>

<script>
    import IconChainStitch from "@/icons/IconChainStitch";
    import IconDoubleCrochet from "@/icons/IconDoubleCrochet";
    import IconDoubleTrebleCrochet from "@/icons/IconDoubleTrebleCrochet";
    import IconHalfDoubleCrochet from "@/icons/IconHalfDoubleCrochet";
    import IconSingleCrochet from "@/icons/IconSingleCrochet";
    import IconSlipstitch from "@/icons/IconSlipstitch";
    import IconTrebleCrochet from "@/icons/IconTrebleCrochet";

    export default {
        props: {
            iconName: {
                type: String,
                default: 'noNameGiven'
            },
            width: {
                type: [Number, String],
                default: 25
            },
            height: {
                type: [Number, String],
                default: 25
            },
            iconColor: {
                type: String,
                default: 'currentColor'
            }
        },
        components: {
            IconChainStitch,
            IconDoubleCrochet,
            IconDoubleTrebleCrochet,
            IconHalfDoubleCrochet,
            IconSingleCrochet,
            IconSlipstitch,
            IconTrebleCrochet
        },
    }
</script>

<style scoped>
    svg {
        display: inline-block;
        vertical-align: baseline;
        margin-bottom: -2px;
    }
</style>