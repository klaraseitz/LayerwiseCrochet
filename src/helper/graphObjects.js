import { v4 as uuidv4 } from 'uuid';

class Node {
    constructor(type, layer, start, previousIndex, insertsIndices, nextIndex, isIncrease, uuid) {
        this.type = type || "";
        this.layer = layer || 0;
        this.start = start || false;
        this.previous = previousIndex || null;
        this.inserts = insertsIndices || [];
        this.next = nextIndex || null;
        this.isIncrease = isIncrease || true;
        this.uuid = uuid || uuidv4();
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
            "uuid": this.uuid
        };

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
        this.source = source || null; // TODO: the specific null test shouldnt be necessary with uuids anymore
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