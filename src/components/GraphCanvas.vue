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
                // .nodeCanvasObject(({ id, x, y }, ctx) => {
                //     ctx.fillStyle = "#000000";
                //     [
                //         () => {
                //             let radius = 0;
                //             let angle = 0;
                //             ctx.beginPath();
                //             ctx.moveTo(x,y);
                //             for (let n = 0; n < 40; n++) {
                //                 radius += 0.2;
                //                 // make a complete circle every 50 iterations
                //                 angle += (Math.PI * 2) / 20;
                //                 let newX = x + radius * Math.cos(angle);
                //                 let newY = y + radius * Math.sin(angle);
                //                 ctx.lineTo(newX, newY);
                //             }
                //
                //             ctx.stroke();
                //         }, // magic ring
                //         () => {ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * Math.PI); ctx.fill();}, // slipstitch
                //         () => {ctx.beginPath();
                //             ctx.moveTo(x-10, y); ctx.lineTo(x + 10, y ); ctx.moveTo(x, y-10); ctx.lineTo(x, y+10);
                //             ctx.stroke();
                //         }, // single crochet
                //         () => {
                //             ctx.beginPath(); ctx.moveTo(x, y-15); ctx.lineTo(x, y+15 ); ctx.moveTo(x - 10, y-15); ctx.lineTo(x +10, y-15); // T shape
                //             ctx.stroke();
                //         }, // hdc
                //         () => {
                //             ctx.beginPath(); ctx.moveTo(x, y-15); ctx.lineTo(x, y+15 ); ctx.moveTo(x - 10, y-15); ctx.lineTo(x +10, y-15); // T shape
                //             ctx.moveTo(x-5, y+5); ctx.lineTo(x+5, y-5 ); // middle slash
                //             ctx.stroke();
                //         }, // dc
                //         () => {
                //             ctx.beginPath(); ctx.moveTo(x, y-15); ctx.lineTo(x, y+15 ); ctx.moveTo(x - 10, y-15); ctx.lineTo(x +10, y-15); // T shape
                //             ctx.moveTo(x-5, y); ctx.lineTo(x+5, y-10 ); // top slash
                //             ctx.moveTo(x-5, y+10); ctx.lineTo(x+5, y ); // bottom slash
                //             ctx.stroke();
                //         }, // tr
                //         () => {
                //             ctx.beginPath(); ctx.moveTo(x, y-15); ctx.lineTo(x, y+15 ); ctx.moveTo(x - 10, y-15); ctx.lineTo(x +10, y-15); // T shape
                //             ctx.moveTo(x-5, y); ctx.lineTo(x+5, y-10 ); // top slash
                //             ctx.moveTo(x-5, y+5); ctx.lineTo(x+5, y-5 ); // middle slash
                //             ctx.moveTo(x-5, y+10); ctx.lineTo(x+5, y ); // bottom slash
                //             ctx.stroke();
                //         }, //dtr
                //         () => {
                //             ctx.save(); ctx.scale(1.3, 1); // saves settings before scaling
                //             ctx.beginPath();
                //             ctx.arc(x/1.3, y, 5, 0, 2 * Math.PI, false); ctx.stroke(); // drawing circle, normalizing scaled x coordinate
                //             ctx.closePath(); ctx.restore(); // restores settings from last save (next drawings are unaffected by scaling)
                //         }, // chain stitch
                //
                //     ][id%8]();
                // })
                .linkCanvasObjectMode(() => 'after')
                .linkCanvasObject((link, ctx) =>{
                    let n1Vec = new Vector(link.source.x, link.source.y, link.source.z);
                    let n2Vec = new Vector(link.target.x, link.target.y, link.target.z);
                    let linkVec = n1Vec.subtract(n2Vec).unit();
                    let perpendicularVec = new Vector(0, 1, 0);
                    let angle = perpendicularVec.unitAngleTo(linkVec);
                    let centerX = (link.source.x + link.target.x) / 2;
                    let centerY = (link.source.y + link.target.y) / 2;

                    ctx.save();
                    ctx.translate(centerX, centerY); //translate to center of shape
                    if(linkVec.x < 0){
                        ctx.rotate(Math.PI + angle);
                    }else{
                        ctx.rotate(Math.PI -angle);
                    }
                    ctx.translate(-centerX, -centerY);

                    ctx.beginPath();
                    stitchCanvas.drawSlipstitch(ctx, centerX, centerY);
                    ctx.stroke();
                    ctx.closePath(); ctx.restore();
                })
        }
    }
</script>

<style scoped>

</style>