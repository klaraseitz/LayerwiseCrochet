export const convertToText = {
    data() {
        return {}
    },
    methods: {
         graphToSymbols() {
            console.log("trying to convert the graph to text now");
            let graphData = {"nodes": this.graph.graphData().nodes, "links": []};
             this.graph.graphData().links.forEach(link => {
                 graphData.links.push(link.export());
             });
            console.log(graphData);

            let symbolsPerLayer = [];
            let nodes = this.graph.graphData().nodes;
            let stitchRepetition = 0;
            let previousStitch = null;
            let currentSymbols = [];
            let sameStitchSymbols = [];
            let previousLayer = 0;
            let increasedNode = null;
            let inSameStitch = false;

            for(let i=0;i<nodes.length; i++){

                let currentLayer = nodes[i].layer;
                if(currentLayer > previousLayer){
                    // add last info to current layer:
                    if(inSameStitch){
                        currentSymbols.push("(");
                        currentSymbols = currentSymbols.concat(sameStitchSymbols);
                        if(stitchRepetition > 0){
                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                        }
                        currentSymbols.push(")");
                    }else{
                        if(stitchRepetition > 0){
                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                        }
                    }
                    this.setSlipStitch(nodes[i-1], currentSymbols);

                    symbolsPerLayer[previousLayer] = currentSymbols;
                    console.log("currentSymbols of layer "+currentLayer+": ");
                    console.log(currentSymbols);
                    currentSymbols = [];
                    sameStitchSymbols = [];
                    previousLayer = currentLayer;
                    stitchRepetition = 0;
                    inSameStitch = false;
                    increasedNode = null;
                    previousStitch = null;
                }

                switch (nodes[i].type) {
                    case 'mr':
                        currentSymbols = ["mr"];
                        break;
                    case 'ch':
                        // found a ch
                        if(stitchRepetition === 0){ // no stitch found so far
                            stitchRepetition++;
                        }else{
                            if(previousStitch.type === "ch"){ // found repeating ch's
                                stitchRepetition++;
                            }else{ // other stitches repetition just ended
                                // stitches might be in same stitch with what comes after ch's
                                sameStitchSymbols.push(""+stitchRepetition+previousStitch.type);
                                stitchRepetition = 1; // found 1 ch so far
                            }
                        }
                        break;
                    case 'hole':
                        // ignore holes for now
                        console.warn("found a hole. Not supported for text generation. output may be incorrect");
                        break;
                    default: // any other stitch type like sc, dc, hdc ...
                        // check if its increasing or decreasing
                        if(nodes[i].isIncrease){
                            if(stitchRepetition === 0) { // first stitch of round or after decrease
                                // check for skips:
                                this.setNrOfSkips(nodes[i], currentSymbols);

                                // are there multiple inserts?
                                if(this.getNrOfInsertsIntoNode(nodes[i]) > 1){
                                    inSameStitch = true;
                                    stitchRepetition++;
                                }else{
                                    stitchRepetition++;
                                    inSameStitch = false;
                                }
                            }else{ // not first occurrence
                                if(inSameStitch){
                                    if(increasedNode === nodes[i].inserts[0]){ // still inserting into same stitch
                                        if(previousStitch.type === nodes[i].type){
                                            stitchRepetition++;
                                        }else{
                                            sameStitchSymbols.push(""+stitchRepetition+previousStitch.type);
                                            stitchRepetition = 1;
                                        }
                                    }else{ // now new insertion stitch
                                        // save same stitch symbols
                                        currentSymbols.push("(");
                                        currentSymbols = currentSymbols.concat(sameStitchSymbols);
                                        if(stitchRepetition > 0){
                                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                        }
                                        currentSymbols.push(")");
                                        sameStitchSymbols = [];

                                        // check for skips:
                                        this.setNrOfSkips(nodes[i], currentSymbols);

                                        stitchRepetition = 1;
                                        if(this.getNrOfInsertsIntoNode(nodes[i]) > 1) {
                                            inSameStitch = true;
                                        }else{
                                            inSameStitch = false;
                                        }
                                    }
                                }else{ // not in same stitch
                                    if(this.getNrOfInsertsIntoNode(nodes[i]) > 1){
                                        // save previous stitches
                                        currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                        inSameStitch = true;
                                        stitchRepetition = 1;
                                    }else{ // continuing to be not in same stitch
                                        if(previousStitch.type === nodes[i].type){
                                            stitchRepetition++;
                                        }else{ // not same stitch type
                                            // save previous stitches
                                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                            stitchRepetition = 1;
                                        }
                                        inSameStitch = false;
                                    }
                                    // check for skips:
                                    this.setNrOfSkips(nodes[i], currentSymbols);
                                }
                            }
                            increasedNode = nodes[i].inserts[0];
                        }else{ // decreasing
                            // save any previously unadded stitches:
                            if(inSameStitch){
                                currentSymbols.push("(");
                                currentSymbols = currentSymbols.concat(sameStitchSymbols);
                                sameStitchSymbols = [];
                                if(stitchRepetition > 0){
                                    currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                }
                                currentSymbols.push(")");
                            }
                            // reset values
                            stitchRepetition = 0;
                            inSameStitch = false;
                            increasedNode = null;

                            let amountOfDecreases = nodes[i].inserts.length;
                            currentSymbols.push(""+amountOfDecreases+nodes[i].type+"Dec");
                        }
                }
                previousStitch = nodes[i];
            }
            // add final symbols of last layer:
             if(inSameStitch){
                 currentSymbols.push("(");
                 currentSymbols = currentSymbols.concat(sameStitchSymbols);
                 if(stitchRepetition > 0){
                     currentSymbols.push(""+stitchRepetition+previousStitch.type);
                 }
                 currentSymbols.push(")");
             }else{
                 if(stitchRepetition > 0){
                     currentSymbols.push(""+stitchRepetition+previousStitch.type);
                 }
             }
             this.setSlipStitch(nodes[nodes.length - 1], currentSymbols);
             symbolsPerLayer[previousLayer] = currentSymbols;
             console.log("symbolsPerLayer: ");
             console.log(symbolsPerLayer);
         },
        setNrOfSkips(currentNode, currentSymbols){
            let lastInsertedNode = this.getLastInsertedNode(currentNode);
            let skips = 0;
            if(lastInsertedNode){
                skips = this.distanceBetweenNodes(currentNode.inserts[currentNode.inserts.length - 1], lastInsertedNode);
            }
            if(skips > 0){
                currentSymbols.push("skip" + skips);
            }
        },
        distanceBetweenNodes(node1_id, node2_id){ // as long as all nodes are sorted in actual creation order this works
             let node1 = this.getNode(node1_id);
             let node2 = this.getNode(node2_id);
             if(node1.index < node2.index){ // we ran over the end of the layer
                 let count = 0;
                 let nextNode = this.getNode(node2.next);
                 while(nextNode.uuid !== node1.uuid || count > 10){
                     nextNode = this.getNode(nextNode.next);
                     count++;
                 }
                 return count;
             }
             return Math.abs(node1.index - node2.index) - 1;
        },
        getLastInsertedNode(currentNode){
             let previousNode = this.getNode(currentNode.previous);
             while(previousNode && previousNode.inserts.length === 0){
                 if(previousNode.layer < currentNode.layer){
                     return previousNode.uuid;
                 }
                 previousNode = this.getNode(previousNode.previous);
             }
             if(previousNode){
                 return previousNode.inserts[previousNode.inserts.length - 1];
             }else{
                 return null;
             }
        },
        getNrOfInsertsIntoNode(node){
             let insertedNode_id = node.inserts[0];
             let counter = 0;
             let links = this.graph.graphData().links;
             for(let i = 0; i < links.length; i++){
                 if(links[i].inserts && links[i].target.uuid === insertedNode_id){
                     counter++;
                 }
             }
             return counter;
        },
        setSlipStitch(node, currentSymbols){
            let links = this.graph.graphData().links;
            let layerEndsInSlipstitch = false;
            for(let i = 0; i < links.length; i++){
                if( (links[i].target.uuid === node.uuid || links[i].source.uuid === node.uuid) && links[i].slipstitch){
                    layerEndsInSlipstitch = true;
                    break;
                }
            }
            if(layerEndsInSlipstitch){
                currentSymbols.push("slst");
            }
        }
    }
}