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
    var len = (this.length += 1);
    var list = this._list;

    var comparfn = this._comparFunc;
    // runs 5% faster with this redundant insert
    list[len] = item;

    var idx = len;
    while (idx > 1) {
        var vp = list[idx >> 1];
        if (comparfn(item, vp) < 0) {
            list[idx] = vp;
            idx = idx >> 1;
        }
        else {
            list[idx] = item;
            return;
        }
    }
    list[1] = item;
};
Heap.prototype.append = Heap.prototype.insert;
Heap.prototype.push = Heap.prototype.insert;

Heap.prototype.peek = function Heap_peek( ) {
    return this._list[1];
};

Heap.prototype.remove = function Heap_remove( ) {
    var len = this.length;
    var list = this._list;
    var ret = list[1];

    if (len < 2) {
        if (len < 1) return undefined;
        list[1] = undefined;
        this.length = 0;
        return ret;
    }
    else {
        var list = this._list;
        var idx = 1;
        var vi = list[len];

        list[len] = undefined;
        this.length = (len -= 1);

        // bubble value down to reestablish partial ordering
        var comparfn = this._comparFunc;
        while (true) {
            var l = 2 * idx, r = 2 * idx + 1;
            var vl = list[l], vr = list[r];
            if (r <= len && comparfn(vr, vi) < 0) {
                if (comparfn(vl, vr) < 0) {
                    list[idx] = vl;
                    idx = l;
                    vi = vl;
                }
                else {
                    list[idx] = vr;
                    idx = r;
                    vi = vr;
                }
            }
            else if (l <= len && comparfn(vl, vi) < 0) {
                var vl = list[l];
                list[idx] = vl;
                idx = l;
                vi = vl;
            }
            else {
                list[idx] = vi;
                break;
            }
        }
    }

    if (this._freeSpace) this._freeSpace(list, len);

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
