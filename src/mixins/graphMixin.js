import saveAs from "file-saver";
import IndexCounter from "@/helper/indexCounter";
import {
    CommandAddInitialStitch,
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
                case 'auto_complete':
                    this.handleAutoIncrease(trigger.numStitches, trigger.numRepetitions);
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
                    let actions = commandTracker.execute(new CommandAddInitialStitch("mr"));
                    this.handleAction(actions);
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
        handleAutoIncrease(numStitches, numRepetitions) {
            console.log("current stitch is:");
            console.log(this.currentNode);
            console.log("Now i'd like to repeat the last "+ numStitches + " for " + numRepetitions + " times.");
            console.log("i will start autocompleting into this stitch:");
            const nodes = this.graph.graphData().nodes
            let insertNode = nodes[this.currentNode.inserts[0]];
            let startNode = nodes[insertNode.next];
            console.log(startNode);

        },
        getTrigger(data) {
            console.log("graph got unimplemented trigger: " + data);
        },
        startChain(amount, isClosed) {
            let actions = commandTracker.execute(new CommandAddInitialStitch("ch"));
            this.handleAction(actions);
            let firstChain = this.currentNode;
            for(let i = 1; i < amount; i++){
                this.addChain(this.currentNode, 0);
            }
            if(isClosed){
                this.connectWithSlipStitch(this.currentNode, firstChain);
                this.graphLayers = 1;
            }
        },
        addChain(previous){
            let actions = commandTracker.execute(new CommandAddChain(previous, this.graphLayers));
            this.handleAction(actions);
        },
        connectWithSlipStitch(from, to){
            let actions = commandTracker.execute(new CommandConnectWithSlipStitch(from, to));
            this.handleAction(actions);
        },
        addStitch(prevNode, insertNode, type){
            let actions = commandTracker.execute(new CommandAddStitch(prevNode, insertNode, type, this.graphLayers));
            this.handleAction(actions);
        },
        decreaseStitch(previousNode, insertNode) {
            let actions = commandTracker.execute(new CommandAddDecreasingStitch(previousNode, insertNode));
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
                            this.addStitch(this.currentNode, node, this.stitch);
                        }else {
                            this.decreaseStitch(this.currentNode, node);
                        }
                        
                }
            }
        },
        handleNodeRightClick(node) {
            if(this.stitch && (this.stitch !== "ch" || this.stitch !== "slst")){
                this.decreaseStitch(this.currentNode, node);
            }
        },
        savePattern(keepPositions) {
            let pattern = this.printGraph(keepPositions);
            let blob = new Blob([pattern], {type: "application/json;charset=utf-8"});
            saveAs(blob, "pattern.json");
        },
        loadGraphFile(file) {
            this.resetGraph();
            const reader = new FileReader();
            reader.onload = e => this.setGraphFromJson(e.target.result);
            reader.readAsText(file);
        },
        resetGraph() {
            IndexCounter.reset();
            this.graph.graphData({"nodes":[], "links":[]});
            commandTracker.resetHistory();
        },
        addDataToGraph(nodes=[], links=[]) {
            const data = this.graph.graphData();
            data.nodes = data.nodes.concat(nodes);
            data.links = data.links.concat(links);
            this.graph.graphData(data);
            console.log(this.graph.graphData());
        },
        setGraphFromJson(graph) {
            let json = JSON.parse(graph);
            this.graph.graphData(json.graphData);
            this.currentNode = json.currentNode;
            this.graphLayers = json.numLayers;
            IndexCounter.setCounter(json.indexCounter);
        },
        printGraph(withPositions) {
            let graphData = {"nodes": [], "links": []};
            this.graph.graphData().nodes.forEach(node => {
                graphData.nodes.push(node.export(withPositions));
            });
            this.graph.graphData().links.forEach(link => {
                graphData.links.push(link.export());
            });
            let graph = {
                'graphData': graphData,
                'currentNode': this.currentNode.export(withPositions),
                'numLayers': this.graphLayers,
                'indexCounter': IndexCounter.getCounter()
            };
            return JSON.stringify(graph);
        },
        removeLastXGraphElements(numNodes = 0, numLinks = 0) {
            const data = this.graph.graphData();
            data.nodes.splice(-numNodes, numNodes);
            data.links.splice(-numLinks, numLinks);
            this.graph.graphData(data);
        },
        updateNodes(nodes) {
            let data = this.graph.graphData();
            nodes.forEach(node => {
                // Note: you may not replace the nodes or the references in the links will break.
                // Therefore only relevant properties will be updated here.
                data.nodes[node.index].next = node.next;
                data.nodes[node.index].inserts = node.inserts;
                data.nodes[node.index].isIncrease = node.isIncrease;
            });
            this.graph.graphData(data);
        },
        handleAction(commandAction){
            if(commandAction){
                if (commandAction.currentNode) {this.currentNode = commandAction.currentNode}
                if (commandAction.graphLayers) {this.graphLayers = commandAction.graphLayers}

                this.removeLastXGraphElements(commandAction.numNodesToRemove, commandAction.numLinksToRemove);
                this.addDataToGraph(commandAction.newNodes, commandAction.newLinks);
                if(commandAction.updateNodes) {this.updateNodes(commandAction.updateNodes)}
                this.refreshGraph();
            }
        }
    },
};