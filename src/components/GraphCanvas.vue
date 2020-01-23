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
    }

    function addDataToGraph(nodes=[], links=[]) {
        const data = graph.graphData();
        data.nodes = data.nodes.concat(nodes);
        data.links = data.links.concat(links);
        graph.graphData(data);
        console.log("added Data to graph, graph: ");//, graph.graphData());
    }

    function resetGraph() {
        graph.graphData({"nodes":[], "links":[]});
    }

    function uniqueID(){
        let date = Date.now();
        let additionalRandomValue = Math.floor(Math.random()*100);
        return date.toString() + additionalRandomValue.toString();
    }

    export default {
        data() {
            return {
                name: 'GraphCanvas',
                graphLayers: 0,
                currentNode: null
            }
        },
        props: [ 'trigger', 'stitch' ],
        watch: {
            trigger: function (trigger) {
                switch (trigger.name) {
                    case 'start':
                        this.startGraph(trigger.method, trigger.stitchAmount);
                        break;
                    case 'newLayer':
                        this.getTrigger(trigger.name);
                        break;
                    case 'openGraph':
                        this.getTrigger(trigger.name);
                        break;
                    case 'saveGraph':
                        this.getTrigger(trigger.name);
                        break;
                    case 'redo':
                        this.getTrigger(trigger.name);
                        break;
                    case 'undo':
                        this.getTrigger(trigger.name);
                        break;
                    default:
                        console.log("got unexpected trigger name");
                }
            }
        },
        computed: {
            nodes: function() {
                return graph.graphData().nodes;
            },
            links: function() {
                return graph.graphData().links;
            }
        },
        methods: {
            startGraph(method, stitchAmount) {
                resetGraph();
                switch (method){
                    case 'Magic Ring':
                        let magicRing = {"id": uniqueID(), "layer": 0, "start": true, "type": "Magic Ring"};
                        this.currentNode = magicRing.id;
                        addDataToGraph(magicRing, []);
                        break;
                    case 'Line of Chain Stitches':
                        this.startChain(stitchAmount, false);
                        break;
                    case 'Round of Chain Stitches':
                        this.startChain(stitchAmount, true);
                        break;
                    default:
                        console.log("got unknown start method");
                }
            },
            getTrigger(data) {
                console.log("graph got trigger: " + data);
            },
            startChain(amount, isClosed) {
                let firstChain = {"id": uniqueID(), "row": 0, "start": true, "type": "Chain Stitch"};
                addDataToGraph(firstChain, []);
                this.currentNode = firstChain.id;
                for(let i = 1; i < amount; i++){
                    this.addChain(this.currentNode, 0);
                }
                if(isClosed){
                    this.connectWithSlipStitch(this.currentNode, firstChain.id);
                    this.graphLayers = 1;
                }
            },
            addChain(previousID, row){
                let node = {"id": uniqueID(), "row": row, "start": false, "type": "Chain Stitch", "previous": previousID};
                let link = {"source": node.id, "target": previousID};

                this.currentNode = node.id;
                addDataToGraph([node], [link]);
            },
            connectWithSlipStitch(fromID, toID){
                let link = {"source": fromID, "target": toID, "slipstitch": true};

                this.currentNode = toID;
                addDataToGraph([], [link]);
            },
            handleNodeClick(node) {
                console.log("clicked node: " + node.id);
            }
        },
        mounted() {
            let element = this.$refs.canvas;
            graph(element)
                .graphData(gData)
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                this.handleNodeClick(node);
            })
        }
    }
</script>

<style scoped>

</style>