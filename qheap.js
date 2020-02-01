/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * node is at [i], left child is at [2*i], right at [2*i+1].  Root is at [1].
 *
 * Copyright (C) 2014-2020 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

module.exports = Heap;

function isBeforeDefault( a, b ) { return a < b; }

function Heap( opts ) {
    if (!(this instanceof Heap)) return new Heap(opts);

    this.options = !opts ? {} : {
        compar: opts.compar,
        comparBefore: opts.comparBefore,
        freeSpace: opts.freeSpace,
        size: opts.size,
    };

    opts = opts || {};
    if (typeof opts === 'function') opts = {compar: opts};

    if (opts.compar) {
        this._isBefore = function(a, b) { return opts.compar(a,b) < 0 };
    } else if (opts.comparBefore) {
        this._isBefore = opts.comparBefore;
    } else {
        this._isBefore = isBeforeDefault;
    }
    this._freeSpace = opts.freeSpace ? this._trimArraySize : false;
    this._list = new Array(opts.size || 20);
    // 14% slower to mix ints and pointers in an array, even if deleted
    // this._list[0] = undefined;

    this.length = 0;
}

Heap.prototype._list = null;
Heap.prototype._compar = null;
Heap.prototype._isBefore = null;
Heap.prototype._freeSpace = null;
Heap.prototype.length = 0;

/*
 * insert new item at end, and bubble up
 */
Heap.prototype.insert = function Heap_insert( item ) {
    var idx = ++this.length;
    var list = this._list;
    list[idx] = item;

    while (idx > 1) {
        var parentidx = idx >> 1;
        if (!(this._isBefore(item, list[parentidx]))) break;
        list[idx] = list[parentidx];
        idx = parentidx;
    }
    list[idx] = item;
};
Heap.prototype.append = Heap.prototype.insert;
Heap.prototype.push = Heap.prototype.insert;
Heap.prototype.unshift = Heap.prototype.insert;
Heap.prototype.enqueue = Heap.prototype.insert;

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
 *
 * Note that a redundant (c < len &&) test before the c vs c+1 compar lets node v0.10
 * run 4x faster; v4, v5 and v6 run faster without it if using _isBefore and not
 * raw _compar.
 *
 * Note that this version runs faster than the two-pass pull-up-new-root then
 * bubble-up-last-value-from-hole approach (except when inserting pre-sorted data).
 */
Heap.prototype.remove = function Heap_remove( ) {
    var len = this.length;
    if (len < 1) return undefined;
    var list = this._list;
    var ret = list[1];
    var itm = list[len];

    var r = 1, c = 2, _isBefore = this._isBefore;
    while (c < len) {
        var cv = list[c], cv1 = list[c+1];
        if (_isBefore(cv1, cv)) { c++; cv = cv1; }
        if (!(_isBefore(cv, itm))) break;
        list[r] = cv;
        r = c;
        c = c << 1;
    }
    list[r] = itm;
    list[len] = 0;
    this.length = --len;
    if (this._freeSpace) this._freeSpace(this._list, len);

    return ret;
};
Heap.prototype.shift = Heap.prototype.remove;
Heap.prototype.pop = Heap.prototype.remove;
Heap.prototype.dequeue = Heap.prototype.remove;

Heap.prototype.toArray = function toArray( limit ) {
    limit = typeof limit === 'number' ? limit + 1 : this.length + 1;
    return this._list.slice(1, limit);
}

Heap.prototype.copy = function copy( ) {
    var ret = new Heap(this.options);
    for (var i = 1; i <= this.length; i++) ret._list[i] = this._list[i];
    ret.length = this.length;
    return ret;
}

Heap.prototype.sort = function sort() {
    if (this.length < 3) return;
    var isBefore = this._isBefore;

    // trim the array for the sort, ensure first item is smallest, sort
    // note that sorted order is valid heap format
    // Truncating the list is faster than copy-out/copy-in.
    // Note that node-v11 and up are 5x faster to sort 1k numbers than v10.
    this._list.splice(this.length+1);
    this._list[0] = this._list[1];
    this._list.sort(function(a, b) { return isBefore(a, b) ? -1 : 1 });
    this._list[0] = 0;
}

/*
 * Free unused storage slots in the _list.
 * The default is to unconditionally gc, use the options to omit when not useful.
 */
Heap.prototype.gc = function Heap_gc( options ) {
    if (!options) options = {};

    var minListLength = options.minLength;      // smallest list that will be gc-d
    if (minListLength === undefined) minListLength = 0;

    var minListFull = options.minFull;          // list utilization below which to gc
    if (minListFull === undefined) minListFull = 1.00;

    if (this._list.length >= minListLength && (this.length < this._list.length * minListFull)) {
        // gc reallocates the array to free the unused storage slots at the end
        // use splice to actually free memory; 7% slower than setting .length
        // note: list.slice makes the array slower to insert to??  splice is better
        this._list.splice(this.length+1, this._list.length);
    }
}

Heap.prototype._trimArraySize = function Heap__trimArraySize( list, len ) {
    if (len > 10000 && list.length > 4 * len) {
        // use slice to actually free memory; 7% slower than setting .length
        // note: list.slice makes the array slower to insert to??  splice is better
        list.splice(len+1, list.length);
    }
}

Heap.prototype._check = function Heap__check( ) {
    var isBefore = this._isBefore;
    var _compar = function(a, b) { return isBefore(a, b) ? -1 : 1 };

    var i, p, fail = 0;
    for (i=this.length; i>1; i--) {
        // error if parent should go after child, but not if don`t care
        p = i >>> 1;
        // swapping the values must change their ordering, otherwise the
        // comparison is a tie.  (Ie, consider the ordering func (a <= b)
        // that for some values reports both that a < b and b < a.)
        if (_compar(this._list[p], this._list[i]) > 0 &&
            _compar(this._list[i], this._list[p]) < 0)
        {
            fail = i;
        }
    }
    if (fail) console.log("failed at", (fail >>> 1), fail);
    return !fail;
}

// optimize access
Heap.prototype = toStruct(Heap.prototype);
function toStruct(o) { return toStruct.prototype = o }
