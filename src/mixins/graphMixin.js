import saveAs from "file-saver";
import {Node, Link} from "@/helper/graphObjects";
import {
    CommandAddChain,
    CommandAddDecreasingStitch,
    CommandAddStitch,
    CommandConnectWithSlipStitch
} from "@/helper/Command";
import {CommandTracker} from "@/helper/CommandTracker";
const commandTracker = new CommandTracker();

export const graphMixin = {
    data() {
        return {
            graphLayers: 0,
            currentNode: null,
            isIncrease: true,
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
                    this.savePattern(true);
                    break;
                case 'redo':
                    this.handleAction(commandTracker.redo());
                    break;
                case 'undo':
                    this.handleAction(commandTracker.undo());
                    break;
                case 'switchStitchMode':
                    this.isIncrease = trigger.isIncrease;
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
                case 'mr':
                    let magicRing = new Node("mr", 0, true);
                    this.currentNode = magicRing;
                    this.addDataToGraph(magicRing, []);
                    this.graphLayers = 1;
                    break;
                case 'line_of_ch':
                    this.startChain(stitchAmount, false);
                    break;
                case 'round_of_ch':
                    this.startChain(stitchAmount, true);
                    break;
                default:
                    console.log("got unknown start method");
            }
        },
        getTrigger(data) {
            console.log("graph got unimplemented trigger: " + data);
        },
        getNodeById(id) {
            this.graph.graphData().nodes.forEach(node => {
                if(node.id === id){
                    return node;
                }
            });
        },
        startChain(amount, isClosed) {
            let firstChain = new Node("ch", 0, true);
            this.addDataToGraph(firstChain, []);
            this.currentNode = firstChain;
            for(let i = 1; i < amount; i++){
                this.addChain(this.currentNode, 0);
            }
            if(isClosed){
                this.connectWithSlipStitch(this.currentNode, firstChain);
                this.graphLayers = 1;
            }
        },
        addChain(previous){
            let actions = commandTracker.execute(new CommandAddChain(previous, this.graphLayers, this.graph.graphData()));
            this.handleAction(actions);
        },
        connectWithSlipStitch(from, to){
            let actions = commandTracker.execute(new CommandConnectWithSlipStitch(from, to));
            this.handleAction(actions);
        },
        addStitch(prevNodeID, insertNodeID, type){
            let actions = commandTracker.execute(new CommandAddStitch(prevNodeID, insertNodeID, type, this.graphLayers));
            this.handleAction(actions);
        },
        decreaseStitch(previous, insertNodeID) {
            let actions = commandTracker.execute(new CommandAddDecreasingStitch(previous, insertNodeID, this.graph.graphData()));
            this.handleAction(actions);
        },
        handleNodeClick(node) {
            if(this.stitch){
                switch (this.stitch) {
                    case 'ch':
                        this.addChain(this.currentNode);
                        break;
                    case 'slst':
                        this.connectWithSlipStitch(this.currentNode, node);
                        break;
                    default:
                        if(this.isIncrease){
                            this.addStitch(this.currentNode, node.id, this.stitch);
                        }else {
                            this.decreaseStitch(this.currentNode, node.id);
                        }
                        
                }
            }
        },
        handleNodeRightClick(node) {
            if(this.stitch && (this.stitch != "ch" || this.stitch != "slst")){
                this.decreaseStitch(this.currentNode, node.id);
            }
        },
        savePattern(keepPositions) {
            let pattern = this.printGraph(keepPositions);
            let blob = new Blob([pattern], {type: "application/json;charset=utf-8"});
            saveAs(blob, "pattern.json");
        },
        loadGraphFile(file) {
            commandTracker.resetHistory();
            const reader = new FileReader();
            reader.onload = e => this.setGraphFromJson(e.target.result);
            reader.readAsText(file);
        },
        resetGraph() {
            this.graph.graphData({"nodes":[], "links":[]});
            commandTracker.resetHistory();
        },
        addDataToGraph(nodes=[], links=[]) {
            const data = this.graph.graphData();
            data.nodes = data.nodes.concat(nodes);
            data.links = data.links.concat(links);
            this.graph.graphData(data);
            console.log("graphData: ");
            console.log(this.graph.graphData());
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
        removeLastXGraphElements(numNodes = 0, numLinks = 0) {
            const data = this.graph.graphData();
            data.nodes.splice(-numNodes, numNodes);
            data.links.splice(-numLinks, numLinks);
            this.graph.graphData(data);
        },
        handleAction(commandAction){
            if(commandAction){
                if (commandAction.currentNode) {this.currentNode = commandAction.currentNode}
                if (commandAction.graphLayers) {this.graphLayers = commandAction.graphLayers}

                this.addDataToGraph(commandAction.newNodes, commandAction.newLinks);
                this.removeLastXGraphElements(commandAction.numNodesToRemove, commandAction.numLinksToRemove);
                this.refreshGraph();
            }
        }
    },
};