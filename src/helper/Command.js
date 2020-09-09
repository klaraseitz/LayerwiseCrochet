import {
    addInitialStitch,
    addChain,
    addStitch,
    connectWithSlipstitch,
    disconnectFromSlipstitch,
    removeChain,
    removeStitch,
    addDecreasingStitch,
    removeDecreasingStitch,
    addHole,
    removeHole,
} from "@/helper/Actions";

/**
 * The command supertype, which is inherited by subtype commands.
 * @constructor
 * @param {type} normalAction The normal action.
 * @param {type} undoAction The opposite of the normal action.
 * @param {type} parameterObject The values, which will get passed to the actions.
 * @returns {Command}
 */
function Command(normalAction, undoAction, parameterObject) {
    this.execute = normalAction;
    this.undo = undoAction;
    this.values = parameterObject;
}

export function CommandAddInitialStitch(type) {
    // Constructor stealing for inheritance.
    Command.call(this, addInitialStitch, null, {type});
}
// Prototype chaining for inheritance.
CommandAddInitialStitch.prototype = Object.create(Command.prototype);

export function CommandAddChain(previousNode, layer) {
    // Constructor stealing for inheritance.
    Command.call(this, addChain, removeChain, {previousNode, layer});
}
// Prototype chaining for inheritance.
CommandAddChain.prototype = Object.create(Command.prototype);

export function CommandConnectWithSlipStitch(from, to) {
    // Constructor stealing for inheritance.
    Command.call(this, connectWithSlipstitch, disconnectFromSlipstitch, {from, to});
}
// Prototype chaining for inheritance.
CommandConnectWithSlipStitch.prototype = Object.create(Command.prototype);

export function CommandAddStitch(previousNode, insertNode, type, layer, insertionType) {
    // Constructor stealing for inheritance.
    Command.call(this, addStitch, removeStitch, {previousNode, insertNode, type, layer, insertionType});
}
// Prototype chaining for inheritance.
CommandAddStitch.prototype = Object.create(Command.prototype);

export function CommandAddDecreasingStitch(previousNode, insertNode, insertionType) {
    // Constructor stealing for inheritance.
    Command.call(this, addDecreasingStitch, removeDecreasingStitch, {previousNode, insertNode, insertionType});
}
// Prototype chaining for inheritance.
CommandAddDecreasingStitch.prototype = Object.create(Command.prototype);

export function CommandAddHole(surroundingNodes) {
    // Constructor stealing for inheritance.
    Command.call(this, addHole, removeHole, {surroundingNodes: Array.from(surroundingNodes)});
}
// Prototype chaining for inheritance.
CommandAddHole.prototype = Object.create(Command.prototype);