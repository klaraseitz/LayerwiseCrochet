<template>
    <div ref="canvas"></div>
</template>

<script >
    import ForceGraph from 'force-graph';
    import Vector from '@/helper/vector';
    import CrochetCanvas from "@/helper/crochetCanvas";
    const stitchCanvas = new CrochetCanvas();
    const graph = ForceGraph();
    const N = 20;
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
                        this.graphLayers++;
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
            },
            graphLayers: function (trigger) {
                this.$emit("topLayer", this.graphLayers);
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
                this.graphLayers = 0;
                switch (method){
                    case 'Magic Ring':
                        let magicRing = {"id": uniqueID(), "layer": 0, "start": true, "type": "Magic Ring"};
                        this.currentNode = magicRing.id;
                        addDataToGraph(magicRing, []);
                        this.graphLayers = 1;
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
                let firstChain = {"id": uniqueID(), "layer": 0, "start": true, "type": "Chain Stitch"};
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
            addChain(previousID, layer){
                let node = {"id": uniqueID(), "layer": layer, "start": false, "type": "Chain Stitch", "previous": previousID};
                let link = {"source": node.id, "target": previousID};

                this.currentNode = node.id;
                addDataToGraph([node], [link]);
            },
            connectWithSlipStitch(fromID, toID){
                let link = {"source": fromID, "target": toID, "Slipstitch": true};

                this.currentNode = toID;
                addDataToGraph([], [link]);
            },
            addStitch(prevNodeID, insertNodeID, type){
                let node = {"id": uniqueID(), "layer": this.graphLayers, "start": false, "type": type, "previous": prevNodeID};
                let linkToPrevious = {"source": node.id, "target": prevNodeID};
                let linkToInsert = {"source": node.id, "target": insertNodeID, "inserts": true};

                this.currentNode = node.id;
                addDataToGraph([node], [linkToPrevious, linkToInsert]);
            },
            handleNodeClick(node) {
                if(this.stitch){
                    switch (this.stitch) {
                        case 'Chain Stitch':
                            this.addChain(this.currentNode, this.graphLayers);
                            break;
                        case 'Slipstitch':
                            this.connectWithSlipStitch(this.currentNode, node.id);
                            break;
                        default:
                            this.addStitch(this.currentNode, node.id, this.stitch);
                    }
                }
            },
        },
        mounted() {
            let element = this.$refs.canvas;
            graph(element)
                .graphData(gData)
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node)})
                .nodeColor(node => {
                    if(node.layer%2 == 0){
                        return 'red'
                    }else{
                        return 'black'
                    }
                })
                .nodeCanvasObject((node, ctx) => {
                    if(node.type == "Magic Ring" || node.type == "Chain Stitch"){
                        stitchCanvas.draw(node.type, ctx, node.x, node.y);
                    }
                })
                .linkCanvasObjectMode(() => 'after')
                .linkCanvasObject((link, ctx) =>{
                    // Calculate Angle and Center point for placement
                    let n1Vec = new Vector(link.source.x, link.source.y, link.source.z);
                    let n2Vec = new Vector(link.target.x, link.target.y, link.target.z);
                    let linkVec = n1Vec.subtract(n2Vec).unit();
                    let perpendicularVec = new Vector(0, 1, 0);

                    let angle = perpendicularVec.unitAngleTo(linkVec);
                    let x = link.source.x;
                    let y = link.source.y;
                    let middleX = (link.source.x + link.target.x)/2;
                    let middleXÝ = (link.source.y + link.target.y)/2;

                    // Draw on html5 canvas if the edge is of type insert
                    if(link.inserts){
                        ctx.save();
                        ctx.translate(x, y); //translate to center of shape
                        if(linkVec.x < 0){
                            ctx.rotate(Math.PI + angle);
                        }else{
                            ctx.rotate(Math.PI -angle);
                        }
                        ctx.translate(-x, -y);

                        stitchCanvas.draw(link.source.type, ctx, x, y);
                        ctx.restore();
                    }else if(link.Slipstitch){
                        stitchCanvas.draw("Slipstitch", ctx, middleX, middleXÝ);
                    }
                })
        }
    }
</script>

<style scoped>

</style>