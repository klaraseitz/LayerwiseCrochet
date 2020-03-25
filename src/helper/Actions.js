import {Link, Node} from "@/helper/graphObjects";
import IndexCounter from "@/helper/indexCounter";

export function addInitialStitch() {
    let index = this.stitchIndex != null ? this.stitchIndex : IndexCounter.count();
    let firstStitch = new Node(this.values.type, 0, true, null, [], null, true, index);
    this.stitchIndex = firstStitch.index;

    return {
        currentNode: firstStitch,
        newNodes: [firstStitch]
    }
}

export function addChain() {
    let index = this.stitchIndex != null ? this.stitchIndex : IndexCounter.count();
    let node = new Node("ch", this.values.layer, false, this.values.previousNode.index, null, null, true, index);
    this.stitchIndex = node.index;

    let link = new Link(node.index, this.values.previousNode.index);

    this.values.previousNode.next = this.stitchIndex;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [link],
        updateNodes: [this.values.previousNode]
    }
}

export function removeChain() {
    this.values.previousNode.next = null;

    return {
        currentNode: this.values.previousNode,
        graphLayers: this.values.previousNode.layer,
        numNodesToRemove: 1,
        numLinksToRemove: 1,
        updateNodes: [this.values.previousNode]
    }
}

export function connectWithSlipstitch() {
    let link = new Link(this.values.from.index, this.values.to.index, false, true);

    this.values.from.next = this.values.to.index;

    return {
        currentNode: this.values.to,
        newLinks: [link],
        updateNodes: [this.values.from]
    }
}

export function disconnectFromSlipstitch() {
    this.values.from.next = null;

    return {
        currentNode: this.values.from,
        numLinksToRemove: 1,
        updateNodes: [this.values.from]
    }
}

export function addStitch() {
    let index = this.stitchIndex != null ? this.stitchIndex : IndexCounter.count();
    let node = new Node(this.values.type, this.values.layer,false, this.values.previousNode.index, [this.values.insertNode.index], null, true, index);
    this.stitchIndex = node.index;

    let linkToPrevious = new Link(node.index, this.values.previousNode.index);
    let linkToInsert = new Link(node.index, this.values.insertNode.index, true);

    this.values.previousNode.next = this.stitchIndex;

    return {
        currentNode: node,
        newNodes: [node],
        newLinks: [linkToPrevious, linkToInsert],
        updateNodes: [this.values.previousNode]

    }
}

export function removeStitch() {
    this.values.previousNode.next = null;

    return {
        currentNode: this.values.previousNode,
        numNodesToRemove: 1,
        numLinksToRemove: 2,
        updateNodes: [this.values.previousNode]
    }
}

export function addDecreasingStitch() {
    this.previousIsIncrease = this.values.previousNode.isIncrease;
    this.values.previousNode.isIncrease = false;

    let link = new Link(this.values.previousNode.index, this.values.insertNode.index, true, false);

    this.values.previousNode.inserts.push(this.values.insertNode.index);

    return {
        currentNode: this.values.previousNode,
        newLinks: [link],
        updateNodes: [this.values.previousNode]
    }
}

export function removeDecreasingStitch() {
    this.values.previousNode.inserts.pop();
    this.values.previousNode.isIncrease = this.previousIsIncrease;

    return {
        currentNode: this.values.previousNode,
        numLinksToRemove: 1,
        updateNodes: [this.values.previousNode]
    }
}

