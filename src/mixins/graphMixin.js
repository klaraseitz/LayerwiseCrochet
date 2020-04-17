import saveAs from "file-saver";
import {
    CommandAddInitialStitch,
    CommandAddChain,
    CommandAddDecreasingStitch,
    CommandAddStitch,
    CommandConnectWithSlipStitch,
    CommandAddHole
} from "@/helper/Command";
import {Link, Node} from "@/helper/graphObjects";
import {CommandTracker} from "@/helper/CommandTracker";
const commandTracker = new CommandTracker();

export const graphMixin = {
    data() {
        return {
            graphLayers: 0,
            currentNode: null,
            isIncrease: true,
            isEdgeVisible: true,
            colors: {
                "highlight": {rgba_line: "rgba(230, 138, 0, 0.7)", rgba_stitch: "rgba(230, 138, 0, 1)", hex: '#e68a00'},
                "even": {rgba_line: "rgba(255, 0, 0, 0.7)", rgba_stitch: "rgba(230, 138, 0, 1)", hex: '#ff0000'},
                "default": {rgba_line: "rgba(0, 0, 0, 0.7)", rgba_stitch: "rgba(230, 138, 0, 1)", hex: '#000000'},
                "layer_start": {rgba_line: "rgba(0, 0, 255, 0.7)", rgba_stitch: "rgba(230, 138, 0, 1)", hex: '#0000ff'},
                "invisible": {rgba: "rgba(0,0,0,0)", hex: '#00000000'},
            },
            stitchDistances: {
                'ch': 0,
                'sc': 10,
                'hdc': 20,
                'dc': 30,
                'tr': 40,
                'dtr': 50,
                'slst': 0
            },
            highlightedNode: null,
            highlightedLink: null,
            selectedNodes: new Set(),
            highlightAny: true,
            collapsedNodes: new Set(),
            collapsedLinks: new Set(),
            maxLayerToCollapse: -1
        }
    },
    props: [ 'trigger', 'stitch' ],
    watch: {
        trigger: function (trigger) {
            switch (trigger.name) {
                case 'start':
                    this.startGraph(trigger.method, trigger.stitchAmount);
                    break;
                case 'setMaxLayers':
                    this.graphLayers = trigger.layers;
                    if(this.collapsedNodes.size > 0 && this.graphLayers - 2 > this.maxLayerToCollapse) {
                        this.collapseLayers();
                    }
                    break;
                case 'loadGraphFile':
                    this.loadGraphFile(trigger.patternFile);
                    break;
                case 'saveGraph':
                    this.savePattern();
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
                case 'saveTempGraph':
                    // this saves the graph temporarily to local storage before changing dimensions
                    localStorage.graphJson = this.printGraph();
                    this.$emit("switchDimension", trigger.is3D);
                    break;
                case 'toggleEdgeVisibility':
                    this.isEdgeVisible = trigger.visibility;
                    this.refreshGraph();
                    break;
                case 'centerView':
                    this.centerCameraPosition();
                    break;
                case 'startAddHole':
                    this.graph.nodeColor(() => 'grey');
                    this.graph.onNodeClick(this.handleNodeClickToSelect);
                    this.highlightAny = false;
                    break;
                case 'stopAddHole':
                    if(trigger.shouldCreate){
                        this.addHoleNode();
                    }
                    this.graph.nodeColor(() => "rgba(0,0,0,0)");
                    this.graph.onNodeClick(this.handleNodeClick);
                    this.highlightAny = true;
                    this.selectedNodes.clear();
                    break;
                case 'toggleCollapse':
                    if(trigger.isCollapsed){
                        this.expandLayers();
                    }else{
                        this.collapseLayers();
                    }
                    break;
                default:
                    console.warn("got unexpected trigger name");
            }
        },
        graphLayers: function (trigger) {
            this.$emit("topLayer", this.graphLayers);
        }
    },
    methods: {
        startGraph(method, stitchAmount) {
            this.resetGraph();

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
                    console.warn("got unknown start method");
            }
        },
        nodeById() {
            return new Map(this.graph.graphData().nodes.map((d) => [d.uuid, d]));
        },
        getNode(uuid){
          return this.nodeById().get(uuid);
        },
        getNextStitchToInsert(node) {
            let insertNode;
            if(node.inserts.length > 0){
                insertNode = this.getNode(node.inserts[node.inserts.length-1]);
            }else{
                insertNode = this.getNode(node.previous);
            }

            return this.getNode(insertNode.next);
        },
        getPreviousStitches(startStitch, numberOfStitches, stitchList = []) {
            // TODO: when in export the undo history is included I could use also that to get the recent x stitches
            if(numberOfStitches === 0) {
                return stitchList;
            }
            // gets all n previous stitches including the given one.

            // add current Stitch:
            stitchList.push(startStitch);
            // go one back:
            let prevStitch = this.getNode(startStitch.previous);
            return this.getPreviousStitches(prevStitch, numberOfStitches-1, stitchList);
        },
        orderStitches(stitches){
            let orderedStitches = [];
            // start from the back to reverse order
            let currentInsertId = stitches[stitches.length-1].inserts[0];
            let intoSameStitch = [];
            let alreadyPushed = false;
            for(let i = stitches.length-1; i >= 0; i--){
                if(stitches[i].inserts.length > 1){
                    // this should mean that there is a decrease going on
                    let isFirst = true;
                    if(!alreadyPushed) {
                        orderedStitches.push(intoSameStitch);
                    }
                    stitches[i].inserts.forEach(insertId => {
                        intoSameStitch = [];
                        intoSameStitch.push({"type": stitches[i].type, "isIncrease": isFirst});
                        orderedStitches.push(intoSameStitch);
                        alreadyPushed = true;
                        currentInsertId = insertId;
                        isFirst = false;
                    })

                }else{
                    // here is an increase happening
                    if(currentInsertId === stitches[i].inserts[0]){
                        // into the same stitch
                        intoSameStitch.push(stitches[i]);
                        alreadyPushed = false;
                    }else{
                        // not into the same stitch
                        currentInsertId = stitches[i].inserts[0];
                        orderedStitches.push(intoSameStitch);
                        intoSameStitch = [stitches[i]];
                        alreadyPushed = false;
                    }
                }
            }
            if(!alreadyPushed) {orderedStitches.push(intoSameStitch)}
            return orderedStitches;
        },
        handleAutoIncrease(numStitches, numRepetitions) {
            // find the stitches to repeat:
            let stitchesToRepeat=[];

            stitchesToRepeat = this.getPreviousStitches(this.currentNode, numStitches);
            console.log("will repeat these stitches: ");
            console.log(stitchesToRepeat);

            // order stitches so that we know relevant info and know how many stitches go into the same stitch
            let orderedStitches = this.orderStitches(stitchesToRepeat);
            console.log("ordered stitches: ");
            console.log(orderedStitches);
            let nextStitch = this.getNextStitchToInsert(this.currentNode);
            for(let i = 0; i < numRepetitions; i++){
                console.log("will insert this stitch: ");
                console.log(nextStitch);
                // repeating all stitches in order
                for(let k = 0; k < orderedStitches.length; k++){
                    orderedStitches[k].forEach(stitch => {
                        let actions;
                        if(stitch.isIncrease){
                            actions = commandTracker.execute(new CommandAddStitch(this.currentNode, nextStitch, stitch.type, this.graphLayers));
                        }else{
                            actions = commandTracker.execute(new CommandAddDecreasingStitch(this.currentNode, nextStitch));
                        }
                        this.handleAction(actions);
                    });
                    nextStitch = this.getNextStitchToInsert(this.currentNode);
                }
            }

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
            this.refreshGraph();
        },
        handleNodeClickToSelect(node) {
            this.selectedNodes.has(node) ? this.selectedNodes.delete(node) : this.selectedNodes.add(node);
            this.graph.nodeColor(node => this.selectedNodes.has(node) ? 'yellow' : 'grey');
        },
        handleNodeRightClick(node) {
            if(this.stitch && (this.stitch !== "ch" || this.stitch !== "slst")){
                this.decreaseStitch(this.currentNode, node);
            }
        },
        handleNodeHover(node) {
            this.highlightedNode = node ? node : null;
            this.highlightedLink = null;
            this.highlightHoveredElements();
        },
        handleLinkHover(link){
            if(link && link.inserts){
                this.highlightedLink = link;
                this.highlightedNode = link.source;
            }else{
                this.highlightedLink = null;
                this.highlightedNode = null;
            }
            this.highlightHoveredElements();
        },
        highlightHoveredElements(){
            this.graph
                .nodeColor(node => node === this.highlightedNode ? this.colors.highlight.rgba_stitch : this.colors.invisible.rgba)
                .linkColor(link => link === this.highlightedLink && link.inserts ? this.colors.highlight.rgba_line : this.getLineColor(link));
        },
        getStitchColor(node){
            if(node.uuid === this.currentNode.uuid){
                return this.colors.highlight.hex;
            }else if(!this.isEdgeVisible && node.layer % 2 === 0) {
                return this.colors.even.hex;
            }else{
                return this.colors.default.hex;
            }
        },
        getLineColor(link){
            if(this.isEdgeVisible){
                let {source, target} = this.getNodesFromLink(link);
                if(source.layer === target.layer){
                    if(source.layer % 2 === 0){
                        return this.colors.even.rgba_line;
                    }else{
                        return this.colors.default.rgba_line;
                    }
                }else if(!link.inserts){
                    return this.colors.layer_start.rgba_line;
                }
            }
            return this.colors.invisible.rgba;
        },
        getNodesFromLink(link) {
            let source;
            let target;
            // get source/target of the link either by id or from link directly
            if(link.source.type != null && link.target.type != null){
                // the link already refers to nodes in source and target
                source = link.source;
                target = link.target;
            }else{
                // the link so far only has the uuids of the nodes
                this.graph.graphData().nodes.find(node => {
                    if(node.uuid === link.source){
                        source = node
                    }
                    if(node.uuid === link.target){
                        target = node
                    }
                });
            }
            return {
                source,
                target
            }
        },
        addHoleNode() {
          let actions = commandTracker.execute(new CommandAddHole(this.selectedNodes));
          this.handleAction(actions);
        },
        expandLayers() {
            this.addDataToGraph(Array.from(this.collapsedNodes), Array.from(this.collapsedLinks));
            this.collapsedNodes.clear();
            this.collapsedLinks.clear();
        },
        collapseLayers() {
            let maxLayerToCollapse = this.graphLayers - 2;
            let prunedNodes = [];
            let prunedLinks = [];
            this.graph.graphData().nodes.forEach(node => {
                if(node.layer <= maxLayerToCollapse){
                    this.collapsedNodes.add(node);
                }else{
                    prunedNodes.push(node);
                }
            });
            this.graph.graphData().links.forEach(link => {
                let {source, target} = this.getNodesFromLink(link);
                if(source.layer <= maxLayerToCollapse && target.layer <= maxLayerToCollapse){
                    this.collapsedLinks.add(link);
                }else{
                    prunedLinks.push(link);
                }
            });
            this.graph.graphData({nodes: prunedNodes, links: prunedLinks});
        },
        savePattern() {
            let pattern = this.printGraph();
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
            this.graph.graphData({"nodes":[], "links":[]});
            this.graphLayers = 0;
            this.collapsedLinks = new Set();
            this.collapsedNodes = new Set();
            this.maxLayerToCollapse = -1;
            commandTracker.resetHistory();
        },
        addDataToGraph(nodes=[], links=[]) {
            const data = this.graph.graphData();
            data.nodes = data.nodes.concat(nodes);
            data.links = data.links.concat(links);
            this.graph.graphData(data);
        },
        setGraphFromJson(graph) {
            let json = JSON.parse(graph);
            let nodes = json.graphData.nodes.map(node => {
                return Object.assign(new Node(), node);
            });
            let links = json.graphData.links.map(link => {
                return Object.assign(new Link(), link);
            });
            this.graph.graphData({nodes, links});
            this.currentNode = Object.assign(new Node(), json.currentNode);
            this.graphLayers = json.numLayers;
            commandTracker.importHistory(json.history);
        },
        printGraph() {
            let graphData = {"nodes": this.graph.graphData().nodes, "links": []};
            this.graph.graphData().links.forEach(link => {
                graphData.links.push(link.export());
            });
            let graph = {
                'graphData': graphData,
                'currentNode': this.currentNode,
                'numLayers': this.graphLayers,
                'history': commandTracker.exportHistory()
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
                this.getNode(node.uuid).next = node.next;
                this.getNode(node.uuid).inserts = node.inserts;
                this.getNode(node.uuid).isIncrease = node.isIncrease;
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