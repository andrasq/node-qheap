/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * tree where node is at [i], left child is at [2*i], right at [2*i+1].
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

Heap.prototype._compar = function Heap__compar( i, j ) {
    return this._comparFunc(this._list[i], this._list[j]);
}

Heap.prototype.put = function Heap_put( item ) {
    var len = this.length += 1;
    var list = this._list;
    list[len] = item;

    var idx = len, compar = this._comparFunc;
    while (idx > 1) {
        var parent = idx / 2 | 0;
        if (compar(list[idx], list[parent]) < 0) {
            this._swap(idx, parent);
            idx = parent;
        }
        else return;
    }
};
Heap.prototype.insert = Heap.prototype.put;
Heap.prototype.append = Heap.prototype.put;
Heap.prototype.push = Heap.prototype.put;

Heap.prototype.peek = function Heap_peek( ) {
    if (this.length < 1) return null;
    return this._list[1];
};

Heap.prototype.get = function Heap_get( ) {
    var len = this.length;
    if (len < 1) return null;

    var list = this._list;
    var ret = list[1];
    if (len === 1) {
        list[1] = undefined;
        this.length = 0;
        return ret;
    }
    else {
        list[1] = list[len];
        list[len] = undefined;
        this.length = len - 1;

        var idx = 1;
        var comparfn = this._comparFunc;
        var compar = function(i, j) { comparfn(list[i], list[j]); }
        while (true) {
            if (2*idx+1 <= len && compar(2*idx+1, idx) < 0) {
                if (compar(2*idx, 2*idx+1) < 0) {
                    this._swap(idx, 2*idx);
                    idx = 2*idx;
                }
                else {
                    this._swap(idx, 2*idx+1);
                    idx = 2*idx+1;
                }
            }
            else if (2*idx <= len && compar(2*idx, idx) < 0) {
                this._swap(idx, 2*idx);
                idx = 2*idx;
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
    var i, fail = 0;
    for (i=this.length; i>1; i--) {
        // error if parent should go after child, but not if don`t care
        if (this._compar((i/2|0), i) > 0 && this._compar(i, (i/2|0)) < 0) fail = i;
    }
    if (fail) console.log("failed at", (fail/2|0), fail);
    return !fail;
}


// quicktest:
/**

var assert = require('assert');

if (0) {
var i, h = new module.exports();
//for (i=10; i>=1; i--) h.put(i);
for (i=0; i<10000; i++) h.put(Math.random() * 1000 | 0);
console.log("AR: heap ok?", h._check());
//var a = [76, 493, 643, 742, 650]
//for (i=0; i<a.length; i++) h.put(a[i]);
//console.log(h);
//while (h.length > 0) { console.log(i, h.get()); }
var r = [], r2 = [];
while (h.length > 0) { var x = h.get(); r.push(x); r2.push(x); }
var x = r.sort(function(a,b){ return a - b; });
assert.deepEqual(x, r2);
}

var timeit = require('arlib/timeit');

//timeit(10000000, function(){ h = new module.exports() });
// 20m/s 1m || 46m/s iojs-v0.11.15-pre

//timeit(1000000, function(){ Math.random() * 1000000 | 0 });
// 1m: 147m/s v0.10.29 || 87m/s iojs-v0.11.15-pre || 87m/s v0.11.13
// 100k: 100m/s v0.10.29 || 25m/s iojs-v0.11.15-pre || 27m/s v0.11.13

var h = new module.exports();
timeit(100000, function(){ h.put(Math.random() * 1000000 | 0) });
// 1m: 10m/s (w/o spot check above) || 14m/s iojs-v0.11.15-pre
// 100k: 10.5m/s, 1m: 10.7m/s

timeit(100000, function(){ h.get() });
// 1m: 1.8m/s 10k, 2.69m/s 100k, 3m/s all 1m fetched
// 100k: 2.8m/s 10k, 3.4m/s all 100k fetched
// 10k: 3.4m/s all 10k
// w/ inline compar: 100k: 3m/s 10k, 6.3m/s 100k, 10m/s 1m fetched

var t1, i, h = new module.exports();
for (var i=0; i<100; i++) h.put(Math.random() * 1000000000 | 0);

//var t1 = Date.now();
//for (i=1000000; i>=1; i--) h.put(i);
//for (i=1; i<=1000000; i++) h.put(i);
//console.log("AR: ", Date.now()-t1);
// insert reverse sorted: 1.93m/s 1m, 1.92m/s 100k, 1m/s 10k, 1.6m/s 10m
// insert sorted: 15.8m/s 1m
// note: reserve sorted numbers are worst-case; sorted numbers are best-case

var data = new Array(); for (i=0; i<100000; i++) data[i] = Math.random() * 1000000000 | 0;
t1 = Date.now();
for (i=0; i<100000; i++) { h.put(Math.random() * 1000000000 | 0); h.get() };
//for (i=0; i<100000; i++) { h.put(data[i]); h.get() };
console.log("AR: put/get 100k ", Date.now()-t1);
// 2.6m/s put/get data[i] (100k), 2.6m/s put/get Math.random
// timeit(100000, function(){ h.put(Math.random() * 1000000000 | 0); h.get() });
// 2.2m/s on top of 1000, 3.2m/s on top of 100, 740k/s on top of 1m, 5.8m/s on top of 10

var h = new Heap();
for (i=0; i<5; i++) h.put(Math.random() * 1000 | 0);
console.log("AR: heap ok?", h._check());
if (!h._check()) console.log(h);

/**/
