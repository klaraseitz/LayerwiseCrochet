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

    export(withPositions = true) {
        let exportObject = {
            "type": this.type,
            "layer": this.layer,
            "start": this.start,
            "previous": this.previous,
            "inserts": this.inserts,
            "next": this.next,
            "isIncrease": this.isIncrease,
            "index": this.index};

        if(withPositions){
            exportObject.x = this.x;
            exportObject.y = this.y;
            exportObject.z = this.z;
        }
        return exportObject;
    }
}

class Link {
    constructor(source, target, inserts, slipstitch) {
        this.source = source != null ? source : null;
        this.target = target != null ? target : null;
        this.inserts = inserts || false;
        this.slipstitch = slipstitch || false;
    }

    export() {
        return {
            "source": this.source.index != null ? this.source.index : this.source,
            "target": this.target.index != null ? this.target.index : this.target,
            "inserts": this.inserts,
            "slipstitch": this.slipstitch
        }
    }
}

export {Node, Link};