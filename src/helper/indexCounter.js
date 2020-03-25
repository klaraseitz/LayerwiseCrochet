class IndexCounter {
    // singleton to count the indices for 
    constructor() {
        this._counter = -1;
    }

    count() {
        this._counter++;
        return this._counter;
    }

    reset() {
        this._counter = -1;
    }
}

export default (new IndexCounter())