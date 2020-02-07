import {Link, Node} from "@/helper/graphObjects";

export function addChain() {
    let id = this.chainID || null;
    let node = new Node("Chain Stitch", this.values.layer, false, this.values.previousID, true, id);
    let link = new Link(node.id, this.values.previousID);
    this.chainID = node.id;

    return {
        currentNode: node.id,
        newNodes: [node],
        newLinks: [link]
    }
}

export function removeChain() {
    let node = this.values.graph.nodes[this.values.graph.nodes.length - 2];
    return {
        currentNode: node.id,
        graphLayers: node.layer,
        numNodesToRemove: 1,
        numLinksToRemove: 1
    }
}

