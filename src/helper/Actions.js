import {Link, Node} from "@/helper/graphObjects";

export function addChain() {
    let id = this.chainID || null;
    let node = new Node("ch", this.values.layer, false, this.values.previous, true, id);
    let link = new Link(node.id, this.values.previous.id);
    this.chainID = node.id;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [link]
    }
}

export function removeChain() {
    return {
        currentNode: this.values.previous,
        graphLayers: this.values.previous.layer,
        numNodesToRemove: 1,
        numLinksToRemove: 1
    }
}

export function connectWithSlipstitch() {
    let link = new Link(this.values.from.id, this.values.to.id, false, true);
    return {
        currentNode: this.values.to,
        newLinks: [link]
    }
}

export function disconnectFromSlipstitch() {
    return {
        currentNode: this.values.from,
        numLinksToRemove: 1
    }
}

export function addStitch() {
    let nodeID = this.nodeID || null;
    let node = new Node(this.values.type, this.values.layer,false, this.values.previous, true, nodeID);
    let linkToPrevious = new Link(node.id, this.values.previous.id);
    let linkToInsert = new Link(node.id, this.values.insertNodeID, true);
    this.nodeID = node.id;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [linkToPrevious, linkToInsert]
    }
}

export function removeStitch() {
    return {
        currentNode: this.values.previous,
        numNodesToRemove: 1,
        numLinksToRemove: 2
    }
}

export function addDecreasingStitch() {
    this.previousIncrease = this.values.previous.isIncrease;
    this.values.previous.isIncrease = false;
    let link = new Link(this.values.previous.id, this.values.insertNodeID, true, false);


    return {
        currentNode: this.values.previous,
        newLinks: [link]
    }
}

export function removeDecreasingStitch() {
    this.values.previous.isIncrease = this.values.previousIncrease;

    return {
        currentNode: this.values.previous,
        numLinksToRemove: 1
    }
}

