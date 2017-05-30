/**
 * Copyright (C) 2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var timeit = require('qtimeit');

var fastpriorityqueue = require('fastpriorityqueue');
var qheap = require('../');
var heap = require('heap');
var jsprioqueue = require('js-priority-queue');

// rand() from `fastpriorityqueue`
function rand(i) {
    i = i + 10000;
    i = i ^ (i << 16);
    i = (i >> 5) ^ i ;
    return i & 0xFF;
}

function testLoop() {
    var i, b = new qheap();
    for (i = 0; i < 128; i++) { b.insert(rand(i)) }
    for (i = 128; i < 1280; i++) { b.insert(rand(i)) ; b.remove() }
}

function comparAfter(a, b) { return a > b }
function comparAfter2(a, b) { return (a > b) }
function comparSubtract(a, b) { return a - b }
function comparOrder(a, b) { return a < b ? -1 : 1 }
function comparBefore(a, b) { return a < b }
function comparBefore2(a, b) { return (a < b) }


timeit.bench.visualize = true;

var x;
//console.log("new heap");
timeit.bench.preRunMessage = "new heap";
timeit.bench.timeGoal = 0.25;
/**
timeit.bench({
    heap: function(){
        x = new heap() },
    jspriorityqueue: function() {
        x = new jsprioqueue(); },
    fastpriorityqueue_compar: function(){
        x = new fastpriorityqueue(comparAfter) },
    qheap: function(){
        x = new qheap() },
});
**/

// just creating a qheap with different compar functions cuts performance 6x
// fastpriorityqueue same behavior
// x = new qheap({ comparBefore: comparBefore });

timeit.bench.preRunMessage =
    rand.toString() + "\n" +
    testLoop.toString() + "\n" +
    "\n" +
    "new heap + 128 inserts + 1152 insert/removes";
timeit.bench.timeGoal = 1.0;
//timeit.bench.baselineAvg = 20000 * 1280;
//timeit.bench.forkTests = true;
//timeit.bench.verbose = 5;
for (var i=0; i<20; i++) {
timeit.bench({
    // the test from `fastpriorityqueue`
    jsprioqueue: function(){
        var i, b = new jsprioqueue();
        for (i = 0; i < 128; i++) { b.queue(rand(i)) }
        for (i = 128; i < 1280; i++) { b.queue(rand(i)) ; b.dequeue() }
    },
    heap: function(){
        var i, b = new heap();
        for (i = 0; i < 128; i++) { b.push(rand(i)) }
        for (i = 128; i < 1280; i++) { b.push(rand(i)) ; b.pop() }
    },
/**
    // much slower with custom comparator
    heap_compar: function(){
        var i, b = new heap(function(a,b){ return a - b });
        for (i = 0; i < 128; i++) { b.push(rand(i)) }
        for (i = 128; i < 1280; i++) { b.push(rand(i)) ; b.pop() }
    },
**/
    fastpriorityqueue: function(){
        var i, b = new fastpriorityqueue(comparAfter);
        //var i, b = new fastpriorityqueue();
        for (i = 0; i < 128; i++) { b.add(rand(i)) }
        for (i = 128; i < 1280; i++) { b.add(rand(i)) ; b.poll() }
    },
    qheap: function(){
        var i, b = new qheap();
        for (i = 0; i < 128; i++) { b.insert(rand(i)) }
        for (i = 128; i < 1280; i++) { b.insert(rand(i)) ; b.remove() }
    },

    // note: toggling between two comparator functions de-optimizes the code to run 5x slower
    // constructing new fastpriorityqueue with different comparators also kills performance, 6x slower
    // Maybe could build custom insert / remove methods on the fly to work with the comparator,
    // to be optimized separately and not affect the base class methods?
/**
    fastpriorityqueue_compar2: function(){
        var i, b = new fastpriorityqueue(comparAfter2);
        for (i = 0; i < 128; i++) { b.add(rand(i)) }
        for (i = 128; i < 1280; i++) { b.add(rand(i)) ; b.poll() }
    },
    qheap_compar: function(){
        var i, b = new qheap({ comparBefore: comparBefore });
        for (i = 0; i < 128; i++) { b.insert(rand(i)) }
        for (i = 128; i < 1280; i++) { b.insert(rand(i)) ; b.remove() }
    },
    qheap_compar2: function(){
        var i, b = new qheap({ comparBefore: comparBefore2 });
        for (i = 0; i < 128; i++) { b.insert(rand(i)) }
        for (i = 128; i < 1280; i++) { b.insert(rand(i)) ; b.remove() }
    },
/**/
});
timeit.bench.preRunMessage = "----";
timeit.bench.showPlatformInfo = false;
timeit.bench.showRunDetails = false;
//timeit.bench.verbose = 1;
}
