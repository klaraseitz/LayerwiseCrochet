<template>
    <div ref="canvas"></div>
</template>

<script >
    import ForceGraph from 'force-graph'

    const N = 300;
    const gData = {
        nodes: [...Array(N).keys()].map(i => ({ id: i })),
        links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id-1))
            }))
    };

    export default {
        data() {
            return {
                name: 'GraphCanvas'
            }
        },

        mounted() {
            const Graph = ForceGraph();
            let element = this.$refs.canvas;
            Graph(element)
                .graphData(gData);
        }
    }
</script>

<style scoped>

</style>