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
                    let inc_ending = inSameStitch ? "Inc" : "";
                    if(stitchRepetition > 0){
                        currentSymbols.push(""+stitchRepetition+previousStitch.type+inc_ending);
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
                                if(previousStitch.type === nodes[i].type){ // repetition found
                                    if(increasedNode === nodes[i].inserts[0]){ // repetition into same stitch
                                        if(inSameStitch){ // previous repetition into same stitch found
                                            // continues being true
                                            stitchRepetition++;
                                        }else{ // previously no same stitch increase
                                            // save previous stitches:
                                            let reps = stitchRepetition - 1; // ignore last stitch as it will count together with current
                                            if(reps > 0){
                                                currentSymbols.push(""+reps+previousStitch.type);
                                            }
                                            stitchRepetition = 2;
                                            inSameStitch = true;
                                            // now a same stitch repeat has been found (last and current stitch)
                                        }
                                    }else{
                                        if(inSameStitch){ // previously we had a same stitch repetition, now not anymore
                                            // save previous stitches:
                                            currentSymbols.push(""+stitchRepetition+previousStitch.type+"Inc");
                                            increasedNode = nodes[i].inserts[0]; // update which node is being increased
                                            stitchRepetition = 1; // reset repetition counter
                                        }else{ // previously also non same stitch repetition
                                            stitchRepetition++;
                                            increasedNode = nodes[i].inserts[0];
                                        }
                                        inSameStitch = false;
                                    }
                                }else{// other stitch repetition just ended
                                    // save previous stitch
                                    let inc_ending = inSameStitch ? "Inc" : "";
                                    currentSymbols.push(""+stitchRepetition+previousStitch.type+inc_ending)
                                    stitchRepetition = 1;
                                    increasedNode = nodes[i].inserts[0];
                                }
                            }

                        }else{ // decreasing
                            // save any previously unadded stitches:
                            if(stitchRepetition > 0){
                                let inc_ending = inSameStitch ? "Inc" : "";
                                currentSymbols.push(""+stitchRepetition+previousStitch.type + inc_ending);
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
             let inc_ending = inSameStitch ? "Inc" : "";
             if(stitchRepetition > 0){
                 currentSymbols.push(""+stitchRepetition+previousStitch.type+inc_ending);
             }
             symbolsPerLayer[previousLayer] = currentSymbols;
             console.log("symbolsPerLayer: ");
             console.log(symbolsPerLayer);
         }
    }
}