<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)"/>
        <div style="width: 100%; display:flex; justify-content: center">
            <LayerSlider :maxLayer="maxLayer" @changeCurrentLayer="setCurrentLayer"/>
            <GraphCanvas :trigger="graphTriggerMsg" :stitch="stitch" @topLayer="updateMaxLayer" style="width:80%"/>
            <StitchSelector @sendStitch="setStitch($event)"/>
        </div>
    </div>
</template>

<script>
    import ActionToolBar from "@/components/ActionToolBar";
    import GraphCanvas from "@/components/GraphCanvas";
    import LayerSlider from "@/components/LayerSlider";
    import StitchSelector from "@/components/StitchSelector";

    export default {
        data() {
            return {
                name: "PatternEditor",
                graphTriggerMsg: '',
                maxLayer: 0,
                currentLayer: 0,
                stitch: {}
            }
        },
        components: {
            ActionToolBar,
            LayerSlider,
            GraphCanvas,
            StitchSelector
        },
        methods: {
            setGraphTrigger(message) {
                this.graphTriggerMsg = message;
            },
            setStitch(msg) {
                this.stitch = msg.stitch;
            },
            updateMaxLayer(maxLayer) {
                this.maxLayer = maxLayer;
            },
            setCurrentLayer(layer) {
                this.currentLayer = layer;
            }
        }
    }
</script>

<style scoped>

</style>