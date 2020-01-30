<template>
    <div ref="canvas"></div>
</template>

<script >
    import * as THREE from 'three';
    import ForceGraph3D from '3d-force-graph';
    import Vector from '@/helper/vector';
    import CrochetPaths from "@/helper/crochetThreejsPaths";
    const stitchPaths = new CrochetPaths();
    const graph = ForceGraph3D();
    const N = 2;
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
        //console.log("added Data to graph, graph: ");//, graph.graphData());
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
                currentNode: null,
                is3D: true,
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
                    case 'switchDimension':
                        this.is3D = trigger.is3D;
                        graph.refresh();
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
                console.log("graph got unimplemented trigger: " + data);
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
                .numDimensions(this.is3D ? 3 : 2)
                .backgroundColor("#ffffff")
                .d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node)})
                .nodeOpacity(0)
                .nodeRelSize(5)
                .nodeThreeObjectExtend(true)
                .nodeThreeObject((node) => {
                    // all drawings are relative to the nodes' current coordinates
                    if(node.type === "Magic Ring" || node.type === "Chain Stitch"){
                        return stitchPaths.draw(node.type);
                    }else{
                        return false;
                    }
                })
                .linkWidth(0.5)
                .linkColor((link) => {
                    link.color = 'black';
                    return 'black'
                })
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => {
                    if(link.inserts){
                        let source = graph.graphData().nodes.find(node => {
                            return node.id === link.source
                        });

                        if(source && source.type){
                            return stitchPaths.draw(source.type);
                        }
                    }else if(link.Slipstitch){
                        return stitchPaths.draw("Slipstitch");
                    }
                    return false;
                })
                .linkPositionUpdate((linkObject, { start, end }, link) => {
                    if(!linkObject){
                        return true;
                    }

                    let position;
                    let centerPoint;
                    let startPoint;
                    if(this.is3D){
                        centerPoint = Object.assign(...['x', 'y', 'z'].map(c => ({
                            [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                        })));
                        startPoint = {
                            "x":start.x,
                            "y":start.y,
                            "z":start.z,
                        }
                    }else{
                        centerPoint = Object.assign(...['x', 'y'].map(c => ({
                            [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                        })));
                        startPoint = {
                            "x":start.x,
                            "y":start.y,
                        };

                    }
                    if(link.Slipstitch){
                        position = centerPoint;
                    }else{
                        position = startPoint;
                        // change up vector to decide the spin of the object after the rotate of LookAt
                        // Object.assign(linkObject.up, new THREE.Vector3(0,1,0));
                        let targetVec = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
                        linkObject.lookAt(targetVec); // rotates objects' z-axis to face a point(dont normalize that point or it flickers)
                    }

                    Object.assign(linkObject.position, position);
                });
        }
    }
</script>

<style scoped>

</style>