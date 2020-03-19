import {Link, Node} from "@/helper/graphObjects";

export function addChain() {
    let id = this.chainID || null;
    let node = new Node("ch", this.values.layer, false, this.values.previousNode, null,true, id);
    let link = new Link(node.id, this.values.previousNode.id);
    this.chainID = node.id;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [link]
    }
}

export function removeChain() {
    return {
        currentNode: this.values.previousNode,
        graphLayers: this.values.previousNode.layer,
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
    let node = new Node(this.values.type, this.values.layer,false, this.values.previousNode, this.values.insertNode, true, nodeID);
    let linkToPrevious = new Link(node.id, this.values.previousNode.id);
    let linkToInsert = new Link(node.id, this.values.insertNode.id, true);
    this.nodeID = node.id;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [linkToPrevious, linkToInsert]
    }
}

export function removeStitch() {
    return {
        currentNode: this.values.previousNode,
        numNodesToRemove: 1,
        numLinksToRemove: 2
    }
}

export function addDecreasingStitch() {
    this.previousIsIncrease = this.values.previousNode.isIncrease;
    this.values.previousNode.isIncrease = false;
    let link = new Link(this.values.previousNode.id, this.values.insertNode.id, true, false);

    return {
        currentNode: this.values.previousNode,
        newLinks: [link]
    }
}

export function removeDecreasingStitch() {
    this.values.previousNode.isIncrease = this.previousIsIncrease;

    return {
        currentNode: this.values.previousNode,
        numLinksToRemove: 1,
    }
}

