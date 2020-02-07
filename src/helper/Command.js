import {
    addChain,
    addStitch,
    connectWithSlipstitch,
    disconnectFromSlipstitch,
    removeChain,
    removeStitch,
    addDecreasingStitch,
    removeDecreasingStitch,
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

/**
 * Command subtype for adding a chain.
 * @constructor
 * @extends Command
 * @param {type} previousID, layer, graph The values, which will be passed to the actions.
 * @returns {undefined}
 */
export function CommandAddChain(previousID, layer, graph) {
    // Constructor stealing for inheritance.
    Command.call(this, addChain, removeChain, {previousID, layer, graph});
}
// Prototype chaining for inheritance.
CommandAddChain.prototype = Object.create(Command.prototype);


/**
 * Command subtype for adding a chain.
 * @constructor
 * @extends Command
 * @param {type} previousID, layer, graph The values, which will be passed to the actions.
 * @returns {undefined}
 */
export function CommandConnectWithSlipStitch(fromID, toID) {
    // Constructor stealing for inheritance.
    Command.call(this, connectWithSlipstitch, disconnectFromSlipstitch, {fromID, toID});
}
// Prototype chaining for inheritance.
CommandConnectWithSlipStitch.prototype = Object.create(Command.prototype);

/**
 * Command subtype for adding a chain.
 * @constructor
 * @extends Command
 * @param {type} previousID, layer, graph The values, which will be passed to the actions.
 * @returns {undefined}
 */
export function CommandAddStitch(prevNodeID, insertNodeID, type, layer) {
    // Constructor stealing for inheritance.
    Command.call(this, addStitch, removeStitch, {prevNodeID, insertNodeID, type, layer});
}
// Prototype chaining for inheritance.
CommandAddStitch.prototype = Object.create(Command.prototype);

/**
 * Command subtype for adding a chain.
 * @constructor
 * @extends Command
 * @param {type} previousID, layer, graph The values, which will be passed to the actions.
 * @returns {undefined}
 */
export function CommandAddDecreasingStitch(previousNodeID, insertNodeID, graph) {
    // Constructor stealing for inheritance.
    Command.call(this, addDecreasingStitch, removeDecreasingStitch, {previousNodeID, insertNodeID, graph});
}
// Prototype chaining for inheritance.
CommandAddDecreasingStitch.prototype = Object.create(Command.prototype);

