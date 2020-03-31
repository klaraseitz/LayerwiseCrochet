<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)" @switchDimension="changeDimension($event)"/>
        <div style="width: 100%; display:flex; justify-content: center">
            <LayerSlider :maxLayer="maxLayer" @changeCurrentLayer="setCurrentLayer"/>
            <GraphCanvas3D v-if="is3D"
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           @topLayer="updateMaxLayer"
                           style="width:80%"/>
            <GraphCanvas2D v-else
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           @topLayer="updateMaxLayer"
                           style="width:80%"/>
            <StitchSelector @triggerGraph="setGraphTrigger($event)" @sendStitch="setStitch($event)"/>
        </div>
    </div>
</template>

<script>
    import ActionToolBar from "@/components/ActionToolBar";
    import GraphCanvas3D from "@/components/GraphCanvas3D";
    import GraphCanvas2D from "@/components/GraphCanvas2D";
    import LayerSlider from "@/components/LayerSlider";
    import StitchSelector from "@/components/StitchSelector";

    export default {
        data() {
            return {
                name: "PatternEditor",
                graphTriggerMsg: '',
                maxLayer: 0,
                currentLayer: 0,
                stitch: null,
                is3D: true,
            }
        },
        components: {
            ActionToolBar,
            LayerSlider,
            GraphCanvas2D,
            GraphCanvas3D,
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
            },
            changeDimension(is3D){
                this.is3D = is3D;
            },
        }
    }
</script>

<style scoped>

</style>