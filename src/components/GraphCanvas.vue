<template>
    <div ref="canvas"></div>
</template>

<script >
    import * as THREE from 'three';
    import ForceGraph3D from '3d-force-graph';
    import saveAs from 'file-saver';
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

    function setGraphFromJson(json) {
        graph.graphData(json);
    }

    function uniqueID(){
        let date = Date.now();
        let additionalRandomValue = Math.floor(Math.random()*100);
        return date.toString() + additionalRandomValue.toString();
    }

    function printGraph(withPositions) {
        let niceGraph = {"nodes": [], "links": []};
        graph.graphData().nodes.forEach(node => {
            if(withPositions){
                niceGraph.nodes.push({"id": node.id, "row": node.row, "start": node.start,
                    "end": node.end, "inserts": node.inserts, "layer": node.layer,
                    "type": node.type, "next": node.next,
                    "x": node.x, "y": node.y, "z": node.z});
            }else{
                niceGraph.nodes.push({"id": node.id, "row": node.row, "start": node.start,
                    "end": node.end, "inserts": node.inserts,
                    "type": node.type, "next": node.next});
            }
        });
        graph.graphData().links.forEach(link => {
            niceGraph.links.push({"source": link.source.id, "target": link.target.id, "inserts": link.inserts, "Slipstitch": link.Slipstitch});
        });
        return JSON.stringify(niceGraph);
    }

    export default {
        data() {
            return {
                name: 'GraphCanvas',
                graphLayers: 0,
                currentNode: null,
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
                    case 'loadGraphFile':
                        this.loadGraphFile(trigger.patternFile);
                        break;
                    case 'saveGraph':
                        this.savePattern(false);
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
            savePattern(keepPositions) {
                let pattern = printGraph(keepPositions);
                let blob = new Blob([pattern], {type: "application/json;charset=utf-8"});
                saveAs(blob, "pattern.json");
            },
            loadGraphFile(file) {
                const reader = new FileReader();
                reader.onload = e => this.loadGraph(e.target.result);
                reader.readAsText(file);
            },
            loadGraph(graph) {
                console.log("loading Graph");
                let jsonGraph = JSON.parse(graph);
                setGraphFromJson(jsonGraph);
                let lastNode = jsonGraph.nodes[jsonGraph.nodes.length - 1];
                this.currentNode = lastNode.id;
                this.graphLayers = lastNode.layer;
            }
        },
        mounted() {
            let element = this.$refs.canvas;
            graph(element)
                .graphData(gData)
                .numDimensions(3)
                .backgroundColor("#ffffff")
                //.d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
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
                        return stitchPaths.draw(node.type).rotateX(1/2*Math.PI);
                    }else{
                        return false;
                    }
                })
                .linkWidth(1)
                .linkColor(() => 'rgba(0, 0, 0, 100)')
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => {
                    if(link.inserts){
                        let nodeID = link.source;
                        let source = graph.graphData().nodes.find(node => {
                            return node.id === nodeID
                        });
                        if(source && source.type){
                            return stitchPaths.draw(source.type);
                        }
                    }else if(link.Slipstitch){
                        return stitchPaths.draw("Slipstitch").rotateX(1/2*Math.PI);
                    }
                    return false;
                })
                .linkPositionUpdate((linkObject, { start, end }, link) => {
                    if(!linkObject){
                        return true;
                    }

                    let position;
                    let centerPoint = Object.assign(...['x', 'y', 'z'].map(c => ({
                        [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                    })));
                    let startPoint = {
                        "x": start.x,
                        "y": start.y,
                        "z": start.z,
                    };
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