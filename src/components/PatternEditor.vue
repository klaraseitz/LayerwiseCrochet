<template>
    <div>
        <ActionToolBar/>
        <div style="width: 100%; display:flex; justify-content: center">
            <LayerSlider/>
            <GraphCanvas style="width:80%"/>
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
        name: "PatternEditor",
        components: {
            ActionToolBar,
            LayerSlider,
            GraphCanvas,
            StitchSelector
        }
    }
</script>

<style scoped>

</style>