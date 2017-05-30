qheap
=====

[![Build Status](https://api.travis-ci.org/andrasq/node-qheap.svg?branch=master)](https://travis-ci.org/andrasq/node-qheap)
[![Coverage Status](https://codecov.io/github/andrasq/node-qheap/coverage.svg?branch=master)](https://codecov.io/github/andrasq/node-qheap?branch=master)

Qheap is a very fast classic heap / priority queue.

A heap is partially ordered balanced binary tree with the property that the
value at the root comes before any value in either the left or right subtrees.
It supports two operations, insert and remove, both O(log n) (and peek, O(1)).
The tree can be efficiently mapped into an array: the root at offset `[1]` and
each node at `[n]` having children Left at `[2*n]` and Right at `[2*n + 1]`.

        var Heap = require('qheap');
        var h = new Heap();
        h.insert('c');
        h.insert('a');
        h.insert('b');
        h.remove();     // => 'a'


Api
---

### new Heap( options )

create a new empty heap.

Options:

- `comparBefore`: a fast comparison function that returns true when the first
argument should be sorted before the second.  This comparator runs much faster than
the three-way `compar` below.  The default is `function(a,b) { return a < b }`.
- `compar` : comparison function to determine the item ordering.  The function
should return a value less than zero if the first argument should be ordered
before the second (compatible with the function passed to `sort()`).  The
default ordering if no compar is specified is by `<`:  `function(a,b){ return
a < b ?  -1 : 1 }`

- `freeSpace` : when the heap shrinks to 1/4 its high-water mark, reallocate the
storage space to free the unused memory, and reset the high-water mark.
Default is false, avoiding the overhead of the array slice.  Note: freeing
space from the array halves the insert rate; use advisedly.

- `size` : the initial capacity of the heap.  The heap is extended as needed,
but for debugging dumps it can be useful to specify a smaller starting size than
the default 100.

If options is a function, it is taken to be the comparison function `compar`.

### insert( item ), push( item ), enqueue( item )

insert the item into the heap and rebalance the tree.  Item can be anything,
only the `compar` function needs to know the actual type.
Push is an alias for insert.

### remove( ), shift( ), dequeue( )

remove and return the item at the root of the heap (the next item in the
sequence), and rebalance the tree.  When empty, returns `undefined`.
Shift is an alias for remove.

### peek( )

return the item at the root of the heap, but do not remove it.  When empty,
returns `undefined`.

### length

the heap `length` property is the count of items currently in the heap.  This
is a read-only property, it must not be changed.

### gc( [options] )

Resize the storage array to free all unused array slots.  The options, if
specified, control when to gc for more efficient operation.

Options:

- `minLength` - do not resize arrays smaller than this cutoff.
  Default 0, resize even the smallest arrays.
- `minFull` - do not resize arrays that are more full than this fraction.
  Default 1.00, resize unless 100% full.


Performance
-----------

Running the `fastpriorityqueue` benchmark:

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

    new heap + 128 inserts + 1152 insert/removes
    qtimeit=0.19.0 node=6.10.2 v8=5.1.281.98 platform=linux kernel=3.16.0-4-amd64 up_threshold=11
    arch=ia32 mhz=4419 cpuCount=8 cpu="Intel(R) Core(TM) i7-6700K CPU @ 4.00GHz"
    name                  speed           rate
    jsprioqueue           6,037 ops/sec   1000 >>>>>
    heap                 29,913 ops/sec   4955 >>>>>>>>>>>>>>>>>>>>>>>>>
    fastpriorityqueue    38,264 ops/sec   6338 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    qheap                41,139 ops/sec   6814 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


Todo
----

- might be more efficient to periodically gc the heap on a timer instead of checking
  on every remove


Related Work
------------

- [heap](https://www.npmjs.com/package/heap) - the classic, slow with custom comparator
- [qheap, this](https://www.npmjs.org/package/qheap) - very fast heap and priority queue
- [fastpriorityqueue](https://www.npmjs.com/package/fastpriorityqueue) - very fast, includes comprehensive list nodejs heaps
- [qlist](https://www.npmjs.com/package/qlist) - very fast circular buffer
