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

export function connectWithSlipstitch() {
    let link = new Link(this.values.fromID, this.values.toID, false, true);

    return {
        currentNode: this.values.toID,
        newLinks: [link]
    }
}

export function disconnectFromSlipstitch() {
    return {
        currentNode: this.values.fromID,
        numLinksToRemove: 1
    }
}

export function addStitch() {
    let nodeID = this.nodeID || null;
    let node = new Node(this.values.type, this.values.graphLayers,false, this.values.prevNodeID, true, nodeID);
    let linkToPrevious = new Link(node.id, this.values.prevNodeID);
    let linkToInsert = new Link(node.id, this.values.insertNodeID, true);
    this.nodeID = node.id;

    return {
        currentNode: node.id,
        newNodes: [node],
        newLinks: [linkToPrevious, linkToInsert]
    }
}

export function removeStitch() {
    return {
        currentNode: this.values.prevNodeID,
        numNodesToRemove: 1,
        numLinksToRemove: 2
    }
}

export function addDecreasingStitch() {
    let previousNode = this.values.graph.nodes.find(node => {
        return node.id === this.values.previousNodeID
    });
    this.previousIncrease = previousNode.isIncrease;
    previousNode.isIncrease = false;
    let link = new Link(this.values.previousNodeID, this.values.insertNodeID, true, false);


    return {
        currentNode: this.values.prevNodeID,
        newLinks: [link]
    }
}

export function removeDecreasingStitch() {
    let previousNode = this.values.graph.nodes.find(node => {
        return node.id === this.values.previousNodeID
    });
    previousNode.isIncrease = this.values.previousIncrease;

    return {
        currentNode: this.values.prevNodeID,
        numLinksToRemove: 1
    }
}

