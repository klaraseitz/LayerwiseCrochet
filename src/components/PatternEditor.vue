<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)"/>
        <div style="width: 100%; display:flex; justify-content: center">
            <LayerSlider/>
            <GraphCanvas :trigger="graphTriggerMsg" :stitch="stitch" style="width:80%"/>
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
            }
        }
    }
</script>

<style scoped>

</style>