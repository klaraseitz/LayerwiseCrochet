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
            let previousLayer = 0;
            let increasedNode = null;
            let inSameStitch = false;

            for(let i=0;i<nodes.length; i++){

                let currentLayer = nodes[i].layer;
                if(currentLayer > previousLayer){
                    // add last info to current layer:
                    if(stitchRepetition > 0){
                        currentSymbols.push(""+stitchRepetition+previousStitch.type);
                        if(inSameStitch){
                            currentSymbols.push(")");
                        }
                    }
                    symbolsPerLayer[previousLayer] = currentSymbols;
                    console.log("currentSymbols of layer "+currentLayer+": ");
                    console.log(currentSymbols);
                    currentSymbols = [];
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
                        if(stitchRepetition === 0){ // none found so far
                            stitchRepetition++;
                        }else{
                            if(previousStitch.type === "ch"){ // found repeating ch's
                                stitchRepetition++;
                            }else{ // other stitches repetition just ended
                                currentSymbols.push(""+stitchRepetition+previousStitch.type); // save it
                                stitchRepetition = 1; // found 1 ch so far
                            }
                        }
                        break;
                    case 'slst':
                        break;
                    case 'hole':
                        // ignore holes for now
                        break;
                    default: // any other stitch type like sc, dc, hdc ...
                        // check if its increasing or decreasing
                        if(nodes[i].isIncrease){
                            if(stitchRepetition === 0){ // first one found
                                // remember which node is being increased
                                increasedNode = nodes[i].inserts[0];
                                stitchRepetition++;
                            }else{
                                if(inSameStitch){ // previous repetition into same stitch found
                                    if(increasedNode === nodes[i].inserts[0]){ // still inserting into same stitch
                                        if(previousStitch.type === nodes[i].type){// same stitch type again found
                                            stitchRepetition++;
                                        }else{ // not same stitch, but same insert point
                                            // save previous stitch
                                            currentSymbols.push(""+ stitchRepetition+previousStitch.type);
                                            stitchRepetition = 1;
                                        }
                                    }else{ // not inserting into same stitch anymore
                                        // save previous stitches:
                                        currentSymbols.push(""+ stitchRepetition+previousStitch.type);
                                        // end same stitch increase
                                        currentSymbols.push(")");
                                        // reset values for new stitch
                                        stitchRepetition = 1;
                                        increasedNode = nodes[i].inserts[0];
                                        inSameStitch = false;
                                    }
                                }else{ // previously not into same stitch
                                    if(increasedNode === nodes[i].inserts[0]){ // but now found same stitch insert
                                        // save previous stitches:
                                        let reps = stitchRepetition - 1; // ignore last stitch as it will count together with current
                                        if(reps > 0){
                                            currentSymbols.push(""+reps+previousStitch.type);
                                        }
                                        stitchRepetition = 1; // keep last stitch

                                        // tell that same stitch insert is starting
                                        currentSymbols.push("(");
                                        inSameStitch = true;
                                        if(previousStitch.type === nodes[i].type){ // still same type
                                            stitchRepetition++;
                                        }else{
                                            // save previous stitches
                                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                            // reset values
                                            stitchRepetition = 1;
                                        }
                                    }else{  // still not in same stitch
                                        increasedNode = nodes[i].inserts[0]; // new increased node
                                        if(previousStitch.type === nodes[i].type) { // still same type
                                            stitchRepetition++;
                                        }else{ // new type found
                                            // save stitches
                                            currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                            // reset values
                                            stitchRepetition = 1;
                                        }
                                    }
                                }
                            }

                        }else{ // decreasing
                            // save any previously unadded stitches:
                            if(stitchRepetition > 0){
                                currentSymbols.push(""+stitchRepetition+previousStitch.type);
                                if(inSameStitch){
                                    currentSymbols.push(")");
                                }
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
             if(stitchRepetition > 0){
                 currentSymbols.push(""+stitchRepetition+previousStitch.type);
                 if(inSameStitch){
                     currentSymbols.push(")");
                 }
             }
             symbolsPerLayer[previousLayer] = currentSymbols;
             console.log("symbolsPerLayer: ");
             console.log(symbolsPerLayer);
         }
    }
}