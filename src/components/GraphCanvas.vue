<template>
    <div ref="canvas"></div>
</template>

<script >
    import ForceGraph from 'force-graph'
    const graph = ForceGraph();
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

    function addDataToGraph(nodes=[], links=[]) {
        const data = graph.graphData();
        data.nodes = data.nodes.concat(nodes);
        data.links = data.links.concat(links);
        graph.graphData(data);
        console.log("added Data to graph, graph: ");//, graph.graphData());
    }

    export default {
        data() {
            return {
                name: 'GraphCanvas',
                graphLayers: 0,
                currentNode: ''
            }
        },
        props: [ 'trigger' ],
        watch: {
            trigger: function (trigger) {
                console.log(trigger);
                this.resetGraph();
            }
        },
        methods: {
            startGraph(stitchType) {
                if(this.graphLayers != 0){
                    alert("Graph is not empty");
                }else{
                    let magicRing = {"id": '0', "row": 0, "start": true, "type": "Magic Ring"};
                    this.currentNode = magicRing.id;
                    addDataToGraph([magicRing], []);
                }
            },
            resetGraph() {
                graph.graphData({"nodes":[], "links":[]});
            }
        },
        mounted() {
            let element = this.$refs.canvas;
            graph(element)
                .graphData(gData);
        }
    }
</script>

<style scoped>

</style>