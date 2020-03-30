/**
 * Class which tracks, executes and undoes commands.
 * @constructor
 * @returns {CommandTracker}
 */
import {getFunctionByName} from "@/helper/Actions";

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
     * @param {CommandAddInitialStitch} command Instance of a command.
     * @returns {undefined}
     */
    execute: function (command) {
        this._actions = command.execute();
        this._currentCommand++;
        this._commandsList[this._currentCommand] = command;
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
        }else if(cmd.undo === null){
            console.error("Can't undo initial stitch");
            return;
        }
        this._actions = cmd.undo();
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
    },
    /**
     * Exports the history and number of current command as object
     * @returns {history}
     */
    exportHistory: function () {
        let cmdHistory = [...this._commandsList];
        cmdHistory.splice(this._currentCommand + 1); // remove redo history

        cmdHistory.forEach(cmd => {
            cmd.execute = cmd.execute.name;
            cmd.undo = cmd.undo ? cmd.undo.name : null;
            for (let [key, value] of Object.entries(cmd.values)) {
                if (typeof value === 'object' && value !== null) {
                    cmd.values[key] = value.export();
                }
            }
        });

        return {
            "commands": cmdHistory,
            "currentCommand": this._currentCommand
        };
    },
    /**
     * Imports the history from a saved graph
     * @returns {undefined}
     */
    importHistory: function (history) {
        // replace function names with functions again
        history.commands.forEach(cmd => {
            cmd.execute = getFunctionByName(cmd.execute);
            cmd.undo = cmd.undo ? getFunctionByName(cmd.undo) : null;
        });
        // set history
        this._commandsList = history.commands;
        this._currentCommand = history.currentCommand;
    }
};