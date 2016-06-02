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
    this.length = 0;
    this._freeSpace = opts.freeSpace ? this._trimArraySize : false;
    this._list = new Array(100);
}

Heap.prototype._list = null;
Heap.prototype._compar = null;
Heap.prototype._freeSpace = null;
Heap.prototype.length = 0;

/*
 * insert new item at end, and bubble up
 */
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

Heap.prototype.size = function Heap_size( ) {
    return this.length;
};

/*
 * return the root, and bubble down last item from top root position
 * when bubbling down, r: root idx, c: child sub-tree root idx, cv: child root value
 * Note that the child at (c == this.length) does not have to be tested in the loop,
 * since its value is the one being bubbled down, so can loop `while (c < len)`.
 * Also, keep the redundant (c < len) test before the c vs c+1 compar, else runs slower.
 *
 * Note that this version runs faster than the two-pass pull-up-new-root then
 * bubble-up-last-value-from-hole approach (except when inserting pre-sorted data).
 */
Heap.prototype.remove = function Heap_remove( ) {
    if (this.length < 1) return undefined;
    var ret = this._list[1];
    var itm = this._list[this.length];
    this._list[this.length] = 0;

    var r = 1, c = 2, cv;
    var len = --this.length;
    while (c < len) {
        cv = this._list[c];
        if (c < len && this._compar(this._list[c+1], cv) < 0) { cv = this._list[c+1] ; c = c+1 }
        if (!(this._compar(cv, itm) < 0)) break;
        this._list[r] = cv;
        r = c;
        c = c << 1;
    }
    if (len) this._list[r] = itm;
    if (this._freeSpace) this._freeSpace(this._list, len);

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
    var i, p, fail = 0;
    for (i=this.length; i>1; i--) {
        // error if parent should go after child, but not if don`t care
        p = i >>> 1;
        if (compar(p, i) > 0 && this._compar(i, p) < 0) fail = i;
    }
    if (fail) console.log("failed at", (fail >>> 1), fail);
    return !fail;
}

// optimize access
Heap.prototype = Heap.prototype;
