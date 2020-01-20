<template>
    <div>
        <ActionToolBar/>
        <GraphCanvas/>
    </div>
</template>

<script>
    import ActionToolBar from "@/components/ActionToolBar";
    import GraphCanvas from "@/components/GraphCanvas";

    export default {
        name: "PatternEditor",
        components: {
            ActionToolBar,
            GraphCanvas
        }
    }
</script>

<style scoped>

</style>