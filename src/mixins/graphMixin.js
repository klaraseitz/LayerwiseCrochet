import saveAs from "file-saver";
import {Node, Link} from "@/helper/graphObjects";

export const graphMixin = {
    data() {
        return {
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
                    this.graph.refresh();
                    console.log("refreshed graph");
                    //this.getTrigger(trigger.name);
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
            this.resetGraph();
            this.graphLayers = 0;
            switch (method){
                case 'Magic Ring':
                    let magicRing = new Node("Magic Ring", 0, true);
                    this.currentNode = magicRing.id;
                    this.addDataToGraph(magicRing, []);
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
            let firstChain = new Node("Chain Stitch", 0, true);
            this.addDataToGraph(firstChain, []);
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
            let node = new Node("Chain Stitch", layer, false, previousID);
            let link = new Link(node.id, previousID);

            this.currentNode = node.id;
            this.addDataToGraph([node], [link]);
        },
        connectWithSlipStitch(fromID, toID){
            let link = new Link(fromID, toID, false, true);

            this.currentNode = toID;
            this.addDataToGraph([], [link]);
        },
        addStitch(prevNodeID, insertNodeID, type){
            let node = new Node(type, this.graphLayers,false, prevNodeID);
            let linkToPrevious = new Link(node.id, prevNodeID);
            let linkToInsert = new Link(node.id, insertNodeID, true);

            this.currentNode = node.id;
            this.addDataToGraph([node], [linkToPrevious, linkToInsert]);
            this.graph.refresh();
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
            let pattern = this.printGraph(keepPositions);
            let blob = new Blob([pattern], {type: "application/json;charset=utf-8"});
            saveAs(blob, "pattern.json");
        },
        loadGraphFile(file) {
            const reader = new FileReader();
            reader.onload = e => this.setGraphFromJson(e.target.result);
            reader.readAsText(file);
        },
        resetGraph() {
            this.graph.graphData({"nodes":[], "links":[]});
        },
        addDataToGraph(nodes=[], links=[]) {
            const data = this.graph.graphData();
            data.nodes = data.nodes.concat(nodes);
            data.links = data.links.concat(links);
            this.graph.graphData(data);
        },
        setGraphFromJson(graph) {
            let json = JSON.parse(graph);
            this.graph.graphData(json.graphData);
            this.currentNode = json.currentNode;
            this.graphLayers = json.numLayers;
        },
        printGraph(withPositions) {
            let graphData = {"nodes": [], "links": []};
            this.graph.graphData().nodes.forEach(node => {
                if(withPositions){
                    graphData.nodes.push({"id": node.id, "type": node.type, "layer": node.layer,
                        "start": node.start, "previous": node.previous,
                        "x": node.x, "y": node.y, "z": node.z});
                }else{
                    graphData.nodes.push({"id": node.id, "type": node.type, "layer": node.layer,
                        "start": node.start, "previous": node.previous});
                }
            });
            this.graph.graphData().links.forEach(link => {
                graphData.links.push({"source": link.source.id, "target": link.target.id, "inserts": link.inserts, "slipstitch": link.slipstitch});
            });
            let graph = {
                'graphData': graphData,
                'currentNode': this.currentNode,
                'numLayers': this.graphLayers,
            };
            return JSON.stringify(graph);
        },
    },
};