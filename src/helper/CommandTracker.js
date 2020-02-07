
/**
 * Class which tracks, executes and undoes commands.
 * @constructor
 * @returns {CommandTracker}
 */
export function CommandTracker() {
    this._actions = {};
    // Contains instances of inherited Commands.
    this._commandsList = [];
    // We do not push and pop commands,
    // instead we keep them all and remember the current.
    this._currentCommand = -1;
}

// Add the methods for command trackers
CommandTracker.prototype = {
    constructor: CommandTracker,
    /**
     * Execute a new command.
     * @param {type} command Instance of a command.
     * @returns {undefined}
     */
    execute: function (command) {
        this._actions = command.execute();
        this._currentCommand++;
        this._commandsList[this._currentCommand] = command;
        console.log(this._commandsList);
        if (this._commandsList[this._currentCommand + 1]) {
            this._commandsList.splice(this._currentCommand + 1);
        }
        return this._actions;
    },
    /**
     * Undo the current command.
     * @returns {undefined}
     */
    undo: function () {
        let cmd = this._commandsList[this._currentCommand];
        if (!cmd) {
            console.error('Nothing to undo');
            return;
        }
        this._actions = cmd.undo(this._currentProgress);
        this._currentCommand--;
        return this._actions;
    },
    /**
     * Redo the undone command.
     * @returns {undefined}
     */
    redo: function () {
        let cmd = this._commandsList[this._currentCommand + 1];
        if (!cmd) {
            console.error('Nothing to redo');
            return;
        }
        this._actions = cmd.execute();
        this._currentCommand++;
        return this._actions;
    },
    /**
     * Resets the history so that there is nothing to re- or undo
     * @returns {undefined}
     */
    resetHistory: function () {
        this._commandsList = [];
        this._currentCommand = -1;
    }
};