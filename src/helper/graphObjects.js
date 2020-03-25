class Node {
    constructor(type, layer, start, previousIndex, insertsIndices, nextIndex, isIncrease, index) {
        this.type = type || "";
        this.layer = layer || 0;
        this.start = start || false;
        this.previous = previousIndex != null ? previousIndex : null;
        this.inserts = insertsIndices || [];
        this.next = nextIndex || null;
        this.isIncrease = isIncrease || true;
        this.index = index != null ? index : -1;
    }
}

class Link {
    constructor(source, target, inserts, slipstitch) {
        this.source = source != null ? source : null;
        this.target = target != null ? target : null;
        this.inserts = inserts || false;
        this.slipstitch = slipstitch || false;
    }
}

export {Node, Link};