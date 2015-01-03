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
    this._resize = opts.resizeArray || false;
    this._list = new Array(1);
    this.length = 0;
}

Heap.prototype._swap = function Heap_swap( i, j ) {
    var t = this._list[i];
    this._list[i] = this._list[j];
    this._list[j] = t;
}

Heap.prototype.put = function Heap_put( item ) {
    var len = this.length += 1;
    var list = this._list;

    var compar = this._comparFunc;
    list[len] = item;
    var idx = len;
    while (idx > 1) {
        var parent = idx >> 1;
        if (compar(list[idx], list[parent]) < 0) {
            var t = list[parent];
            list[parent] = list[idx];
            list[idx] = t;
            idx = parent;
        }
        else return;
    }
};
Heap.prototype.insert = Heap.prototype.put;
Heap.prototype.append = Heap.prototype.put;
Heap.prototype.push = Heap.prototype.put;

Heap.prototype.peek = function Heap_peek( ) {
    if (this.length < 1) return undefined;
    return this._list[1];
};

Heap.prototype.get = function Heap_get( ) {
    var len = this.length;
    var list = this._list;
    var ret = list[1];
    if (len < 2) {
        if (len < 1) return null;
        list[1] = undefined;
        this.length = 0;
        return ret;
    }
    else {
        list[1] = list[len];
        list[len] = undefined;
        len = this.length = len - 1;

        var idx = 1;
        var comparfn = this._comparFunc;
        var compar = function(i, j) { comparfn(list[i], list[j]); }
        while (true) {
            var l = 2*idx, r = 2*idx+1;
            if (r <= len && compar(r, idx) < 0) {
                if (compar(l, r) < 0) {
                    this._swap(idx, l);
                    idx = l;
                }
                else {
                    this._swap(idx, r);
                    idx = r;
                }
            }
            else if (l <= len && compar(l, idx) < 0) {
                this._swap(idx, l);
                idx = l;
            }
            else break;
        }
    }

    if (len > 10000 && list.length > 4 * len) {
        // use slice to actually free memory; 7% slower than setting .length
        if (this._resize) this._list = list.slice(0, this.length);
        else list.length = this.length;
    }

    return ret;
};
Heap.prototype.remove = Heap.prototype.get;
Heap.prototype.shift = Heap.prototype.get;


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
