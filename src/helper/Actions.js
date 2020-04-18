import {Link, Node} from "@/helper/graphObjects";

export function addInitialStitch() {
    let firstStitch = new Node(this.values.type, 0, true, null, [], null, true, this.uuid);
    this.uuid = firstStitch.uuid;

    return {
        currentNode: firstStitch,
        newNodes: [firstStitch]
    }
}

export function addChain() {
    let node = new Node("ch", this.values.layer, false, this.values.previousNode.uuid, null, null, true, this.uuid);
    this.uuid = node.uuid;

    let link = new Link(node.uuid, this.values.previousNode.uuid);

    this.values.previousNode.next = this.uuid;

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
    let link = new Link(this.values.from.uuid, this.values.to.uuid, false, true);

    this.values.from.next = this.values.to.uuid;

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
    let node = new Node(this.values.type, this.values.layer,false, this.values.previousNode.uuid, [this.values.insertNode.uuid], null, true, this.uuid);
    this.uuid = node.uuid;

    let linkToPrevious = new Link(node.uuid, this.values.previousNode.uuid);
    let linkToInsert = new Link(node.uuid, this.values.insertNode.uuid, true);

    this.values.previousNode.next = this.uuid;

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

    let link = new Link(this.values.previousNode.uuid, this.values.insertNode.uuid, true, false);

    this.values.previousNode.inserts.push(this.values.insertNode.uuid);

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

export function addHole() {
    let hole = new Node('hole', 0, false, null, [], null, true, this.uuid);
    this.uuid = hole.uuid;
    let surroundingNodeIds = this.values.surroundingNodes.map(node => node.uuid);
    hole.surroundingNodes = surroundingNodeIds;

    let highestLayer = 0;
    let newLinks = [];
    this.values.surroundingNodes.forEach(node => {
        if(node.layer > highestLayer) {
            highestLayer = node.layer;
        }
        let link = new Link(this.uuid, node.uuid, false, false);
        newLinks.push(link);
    });
    hole.layer = highestLayer;

    return {
        newNodes: [hole],
        newLinks: newLinks
    }
}

export function removeHole() {
    return {
        numLinksToRemove: this.values.surroundingNodes.length,
        numNodesToRemove: 1
    }
}

export function getFunctionByName(name) {
    return eval(name);
}

