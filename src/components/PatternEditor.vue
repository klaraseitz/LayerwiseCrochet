<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)"/>
        <div style="width: 100%; display:flex; justify-content: center;">
            <GraphCanvas3D v-if="is3D"
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           :insertionType="insertionType"
                           @topLayer="updateMaxLayer"
                           @switchDimension="changeDimension($event)"
                           style="width:80%"/>
            <GraphCanvas2D v-else
                           :trigger="graphTriggerMsg"
                           :stitch="stitch"
                           :insertionType="insertionType"
                           @topLayer="updateMaxLayer"
                           @switchDimension="changeDimension($event)"
                           style="width:80%"/>
            <CrochetActions :layer="maxLayer"
                            @triggerGraph="setGraphTrigger($event)"
                            @sendStitch="setStitch($event)"
                            @sendInsertionPointType="setInsertionPointType($event)"
                            @changeMaxLayer="updateMaxLayer"/>
            <ViewButtonBar @triggerGraph="setGraphTrigger($event)"
                        />
        </div>
    </div>
</template>

<script>
    import ActionToolBar from "@/components/ActionToolBar";
    import GraphCanvas3D from "@/components/GraphCanvas3D";
    import GraphCanvas2D from "@/components/GraphCanvas2D";
    import CrochetActions from "@/components/CrochetActions";
    import ViewButtonBar from "@/components/ViewButtonBar";

    export default {
        data() {
            return {
                name: "PatternEditor",
                graphTriggerMsg: '',
                maxLayer: 0,
                stitch: null,
                insertionType: "bothLoops",
                is3D: false,
                isGraphReduced: false,
            }
        },
        components: {
            ActionToolBar,
            GraphCanvas2D,
            GraphCanvas3D,
            CrochetActions,
            ViewButtonBar
        },
        methods: {
            setGraphTrigger(message) {
                this.graphTriggerMsg = message;
            },
            setStitch(msg) {
                this.stitch = msg.stitch;
            },
            setInsertionPointType(msg) {
              this.insertionType = msg.insertionType;
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