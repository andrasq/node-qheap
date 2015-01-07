/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * node is at [i], left child is at [2*i], right at [2*i+1].  Root is at [1].
 *
 * Copyright (C) 2014 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

module.exports = Heap;

function Heap( opts ) {
    opts = opts || {};
    this._comparFunc = opts.compar || function(a, b) { return a < b ? -1 : 1 };
    this._list = new Array(100);
    this._freeSpace = opts.freeSpace ? this._trimArraySize : false;
    this.length = 0;
}

Heap.prototype._swap = function Heap_swap( i, j ) {
    var t = this._list[i];
    this._list[i] = this._list[j];
    this._list[j] = t;
}

Heap.prototype.insert = function Heap_insert( item ) {
    // insert new item at end, and bubble up
    var list = this._list;
    var comparfn = this._comparFunc;
    var idx = (this.length += 1);
    // runs 5% faster with this redundant insert (prefetch?)
    list[idx] = item;

    while (idx > 1) {
        var parentval = list[idx >> 1];
        if (comparfn(item, parentval) < 0) {
            list[idx] = parentval;
            idx = idx >> 1;
        }
        else break;
    }
    list[idx] = item;
};
Heap.prototype.append = Heap.prototype.insert;
Heap.prototype.push = Heap.prototype.insert;

Heap.prototype.peek = function Heap_peek( ) {
    return this._list[1];
};

Heap.prototype.remove = function Heap_remove( ) {
    var len = this.length;
    if (len < 1) return undefined;
    var list = this._list;
    var ret = list[1];

    var item = list[len];
    list[len] = undefined;
    this.length = (len -= 1);

    // removing the root item left a hole.  We fill fill it by
    // sliding up the least-values path all the way from the leaf node,
    // then moving the very last item into that leaf position and bubbling
    // it up from there.  Splitting into slide + bubbleup is 20% faster
    // for a sequence of repeated insert/removes than the classic combined
    // bubble-down with 3-way min() test (caching effect?  The least-values
    // path is more likely to be reused, ie remain cache resident.)
    if (len > 0) {
        var comparfn = this._comparFunc;
        var idx, child;
        for (idx = 1, child = 2; child <= len; child = child << 1) {
            if (child < len && comparfn(list[child+1], list[child]) < 0) child += 1;
            list[idx] = list[child];
            idx = child;
        }
        // idx points to the just vacated leaf node, bubble up item from there
        while (idx > 1) {
            var parentval = list[idx >> 1];
            if (comparfn(item, parentval) < 0) {
                list[idx] = parentval;
                idx = idx >> 1;
            }
            else break;
        }
        list[idx] = item;
        if (this._freeSpace) this._freeSpace(list, len);
    }

    return ret;
};
Heap.prototype.shift = Heap.prototype.remove;

Heap.prototype._trimArraySize = function Heap__trimArraySize( list, len ) {
    if (len > 10000 && list.length > 4 * len) {
        // use slice to actually free memory; 7% slower than setting .length
        // note: list.slice makes the array slower to insert to??  splice is better
        list.splice(len+1, list.length);
    }
}

Heap.prototype._check = function Heap__check( ) {
    var comparfn = this._comparFunc;
    var compar = function(a,b) { return comparfn(a, b); }
    var i, fail = 0;
    for (i=this.length; i>1; i--) {
        // error if parent should go after child, but not if don`t care
        if (compar((i/2|0), i) > 0 && this._compar(i, (i/2|0)) < 0) fail = i;
    }
    if (fail) console.log("failed at", (fail/2|0), fail);
    return !fail;
}
