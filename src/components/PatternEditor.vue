<template>
    <div>
        <ActionToolBar @triggerGraph="setGraphTrigger($event)"/>
        <div style="width: 100%; display:flex; justify-content: center">
            <LayerSlider/>
            <GraphCanvas :trigger="graphTriggerMsg" style="width:80%"/>
            <StitchSelector/>
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
                graphTriggerMsg: ''
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
            }
        }
    }
</script>

<style scoped>

</style>