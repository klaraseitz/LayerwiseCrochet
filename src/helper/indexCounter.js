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

    setCounter(value) {
        this._counter = value;
    }

    getCounter() {
        return this._counter;
    }
}

export default (new IndexCounter())