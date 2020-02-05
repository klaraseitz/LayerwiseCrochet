class Node {
    constructor(type, layer, start, previous) {
        this.type = type || "";
        this.layer = layer || 0;
        this.start = start || false;
        this.previous = previous || null;
        this.id = this.uniqueID();
    }

    uniqueID(){
        let date = Date.now();
        let additionalRandomValue = Math.floor(Math.random()*100);
        return date.toString() + additionalRandomValue.toString();
    }
}

class Link {
    constructor(source, target, inserts, slipstitch) {
        this.source = source || null;
        this.target = target || null;
        this.inserts = inserts || false;
        this.slipstitch = slipstitch || false;
    }
}

export {Node, Link};