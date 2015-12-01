/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * node is at [i], left child is at [2*i], right at [2*i+1].  Root is at [1].
 *
 * Copyright (C) 2014-2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

module.exports = Heap;

function defaultCompar( a, b ) {
    return a < b ? -1 : 1;
}

function Heap( opts ) {
    opts = opts || {};
    this._compar = opts.compar || defaultCompar;
    this._list = new Array(100);
    this._freeSpace = opts.freeSpace ? this._trimArraySize : false;
    this.length = 0;
}

Heap.prototype._compar = null;
Heap.prototype._list = null;
Heap.prototype._freeSpace = null;
Heap.prototype.length = 0;

// insert new item at end, and bubble up
Heap.prototype.insert = function Heap_insert( item ) {
    var idx = ++this.length;
    this._list[idx] = item;

    while (idx > 1) {
        var parentidx = idx >> 1;
        var parentval = this._list[parentidx];
        if (this._compar(item, parentval) < 0) {
            this._list[idx] = parentval;
            idx = parentidx;
        }
        else break;
    }
    this._list[idx] = item;
};
Heap.prototype.append = Heap.prototype.insert;
Heap.prototype.push = Heap.prototype.insert;
Heap.prototype.unshift = Heap.prototype.insert;

Heap.prototype.peek = function Heap_peek( ) {
    return this.length > 0 ? this._list[1] : undefined;
};

// TODO: the .length property hides the method
Heap.prototype.length = function Heap_length( ) {
    return this.length;
};

// return the root, and bubble down last item
Heap.prototype.remove = function Heap_remove( ) {
    if (this.length < 1) return undefined;
    var ret = this._list[1];
    var itm = this._list[this.length--];

    if (this.length > 0) {
        var r = 1, c = 2, cv;
        while (c <= this.length) {
            cv = this._list[c];
            if (c < this.length && this._compar(this._list[c+1], cv) < 0) { cv = this._list[c+1] ; c = c+1 }
            if (this._compar(cv, itm) < 0) {
                this._list[r] = cv;
                r = c;
                c = c << 1;
            }
            else break;
        }
        this._list[r] = itm;
        if (this._freeSpace) this._freeSpace(this._list, this.length);
    }

    return ret;
};
Heap.prototype.shift = Heap.prototype.remove;
Heap.prototype.pop = Heap.prototype.remove;

Heap.prototype._trimArraySize = function Heap__trimArraySize( list, len ) {
    if (len > 10000 && list.length > 4 * len) {
        // use slice to actually free memory; 7% slower than setting .length
        // note: list.slice makes the array slower to insert to??  splice is better
        list.splice(len+1, list.length);
    }
}

Heap.prototype._check = function Heap__check( ) {
    var comparfn = this._compar;
    var compar = function(a,b) { return comparfn(a, b); }
    var i, fail = 0;
    for (i=this.length; i>1; i--) {
        // error if parent should go after child, but not if don`t care
        if (compar((i/2|0), i) > 0 && this._compar(i, (i/2|0)) < 0) fail = i;
    }
    if (fail) console.log("failed at", (fail/2|0), fail);
    return !fail;
}

Heap.prototype = Heap.prototype;
