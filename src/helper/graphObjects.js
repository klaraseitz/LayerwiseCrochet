import { v4 as uuidv4 } from 'uuid';

class Node {
    constructor(type, layer, start, previousIndex, insertsIndices, nextIndex, isIncrease, uuid, x, y, z) {
        this.type = type || "";
        this.layer = layer || 0;
        this.start = start || false;
        this.previous = previousIndex || null;
        this.inserts = insertsIndices || [];
        this.next = nextIndex || null;
        this.isIncrease = isIncrease || true;
        this.surroundingNodes = type === 'hole' ? [] : null;
        this.uuid = uuid || uuidv4();
        if(x && y && z){
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    setSurroundingNodes(nodes) {
        this.surroundingNodes = nodes;
    }
}

class Link {
    constructor(source, target, inserts, slipstitch) {
        this.source = source || null;
        this.target = target || null;
        this.inserts = inserts || false;
        this.slipstitch = slipstitch || false;
    }

    export() {
        return {
            "source": this.source.uuid || this.source,
            "target": this.target.uuid || this.target,
            "inserts": this.inserts,
            "slipstitch": this.slipstitch
        }
    }
}

export {Node, Link};