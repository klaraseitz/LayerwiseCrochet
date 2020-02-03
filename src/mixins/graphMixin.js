import saveAs from "file-saver";

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
            this.resetGraph();
            this.graphLayers = 0;
            switch (method){
                case 'Magic Ring':
                    let magicRing = {"id": this.uniqueID(), "layer": 0, "start": true, "type": "Magic Ring"};
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
            let firstChain = {"id": this.uniqueID(), "layer": 0, "start": true, "type": "Chain Stitch"};
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
            let node = {"id": this.uniqueID(), "layer": layer, "start": false, "type": "Chain Stitch", "previous": previousID};
            let link = {"source": node.id, "target": previousID};

            this.currentNode = node.id;
            this.addDataToGraph([node], [link]);
        },
        connectWithSlipStitch(fromID, toID){
            let link = {"source": fromID, "target": toID, "Slipstitch": true};

            this.currentNode = toID;
            this.addDataToGraph([], [link]);
        },
        addStitch(prevNodeID, insertNodeID, type){
            let node = {"id": this.uniqueID(), "layer": this.graphLayers, "start": false, "type": type, "previous": prevNodeID};
            let linkToPrevious = {"source": node.id, "target": prevNodeID};
            let linkToInsert = {"source": node.id, "target": insertNodeID, "inserts": true};

            this.currentNode = node.id;
            this.addDataToGraph([node], [linkToPrevious, linkToInsert]);
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
            reader.onload = e => this.loadGraph(e.target.result);
            reader.readAsText(file);
        },
        loadGraph(graph) {
            console.log("loading Graph");
            let jsonGraph = JSON.parse(graph);
            this.setGraphFromJson(jsonGraph);
            let lastNode = jsonGraph.nodes[jsonGraph.nodes.length - 1];
            this.currentNode = lastNode.id;
            this.graphLayers = lastNode.layer;
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
        setGraphFromJson(json) {
            this.graph.graphData(json);
        },
        uniqueID(){
            let date = Date.now();
            let additionalRandomValue = Math.floor(Math.random()*100);
            return date.toString() + additionalRandomValue.toString();
        },
        printGraph(withPositions) {
            let niceGraph = {"nodes": [], "links": []};
            this.graph.graphData().nodes.forEach(node => {
                if(withPositions){
                    niceGraph.nodes.push({"id": node.id, "row": node.row, "start": node.start,
                        "end": node.end, "inserts": node.inserts, "layer": node.layer,
                        "type": node.type, "next": node.next,
                        "x": node.x, "y": node.y, "z": node.z});
                }else{
                    niceGraph.nodes.push({"id": node.id, "row": node.row, "start": node.start,
                        "end": node.end, "inserts": node.inserts, "layer": node.layer,
                        "type": node.type, "next": node.next});
                }
            });
            this.graph.graphData().links.forEach(link => {
                niceGraph.links.push({"source": link.source.id, "target": link.target.id, "inserts": link.inserts, "Slipstitch": link.Slipstitch});
            });
            return JSON.stringify(niceGraph);
        },
    },
};