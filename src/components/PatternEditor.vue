<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)"/>
        <div style="width: 100%; display:flex; justify-content: center">
            <GraphCanvas3D v-if="is3D"
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           @topLayer="updateMaxLayer"
                           @switchDimension="changeDimension($event)"
                           style="width:80%"/>
            <GraphCanvas2D v-else
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           @topLayer="updateMaxLayer"
                           @switchDimension="changeDimension($event)"
                           style="width:80%"/>
            <StitchSelector :layer="maxLayer"
                            @triggerGraph="setGraphTrigger($event)"
                            @sendStitch="setStitch($event)"
                            @changeMaxLayer="updateMaxLayer"/>
            <v-btn
                    color="indigo"
                    dark
                    outlined
                    elevation="24"
                    fixed
                    left
                    fab
                    @click="centerView"
            >
                <v-icon>mdi-cube-scan</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
    import ActionToolBar from "@/components/ActionToolBar";
    import GraphCanvas3D from "@/components/GraphCanvas3D";
    import GraphCanvas2D from "@/components/GraphCanvas2D";
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
            changeDimension(is3D){
                this.is3D = is3D;
            },
            centerView(){
                let msg = {name: 'centerView'};
                this.setGraphTrigger(msg);
            }
        }
    }
</script>

<style scoped>

</style>