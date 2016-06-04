qheap
=====

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

### insert( item ), push( item )

insert the item into the heap and rebalance the tree.  Item can be anything,
only the `compar` function needs to know the actual type.
Push is an alias for insert.

### remove( ), shift( )

remove and return the item at the root of the heap (the next item in the
sequence), and rebalance the tree.  When empty, returns `undefined`.
Shift is an alias for remove.

### peek( )

return the item at the root of the heap, but do not remove it.  When empty,
returns `undefined`.

### length

the heap `length` property is the count of items currently in the heap.  This
is a read-only property, it must not be changed.


Performance
-----------

The [fastpriorityqueue](https://www.npmjs.com/package/fastpriorityqueue) repo
includes a handy comparison test, it reports

    Platform: linux 4.3.0-0.bpo.1-amd64 ia32
    AMD Phenom(tm) II X4 B55 Processor
    Node version 5.10.1, v8 version 4.6.85.31

    Comparing against: 
    js-priority-queue: https://github.com/adamhooper/js-priority-queue
    heap.js: https://github.com/qiao/heap.js
    binaryheapx: https://github.com/xudafeng/BinaryHeap
    priority_queue: https://github.com/agnat/js_priority_queue
    js-heap: https://github.com/thauburger/js-heap
    queue-priority: https://github.com/augustohp/Priority-Queue-NodeJS
    priorityqueuejs: https://github.com/janogonzalez/priorityqueuejs
    qheap: https://github.com/andrasq/node-qheap
    yabh: https://github.com/jmdobry/yabh

    FastPriorityQueue x 13,869 ops/sec ±0.31% (100 runs sampled)
    js-priority-queue x 3,290 ops/sec ±0.07% (102 runs sampled)
    heap.js x 4,762 ops/sec ±0.13% (100 runs sampled)
    binaryheapx x 2,804 ops/sec ±0.41% (100 runs sampled)
    priority_queue x 1,977 ops/sec ±0.52% (100 runs sampled)
    js-heap x 141 ops/sec ±0.30% (83 runs sampled)
    queue-priority x 244 ops/sec ±0.95% (92 runs sampled)
    priorityqueuejs x 3,691 ops/sec ±0.75% (74 runs sampled)
    qheap x 14,692 ops/sec ±0.11% (104 runs sampled)
    yabh x 3,182 ops/sec ±0.26% (101 runs sampled)
    Fastest is qheap

    54.568u 0.068s 0:54.47 100.2%   0+0k 0+0io 0pf+0w


Related Work
------------

- [heap](https://www.npmjs.com/package/heap) - the classic, but slow
- [qheap, this](https://www.npmjs.org/package/qheap) - very fast heap and priority queue
- [fastpriorityqueue](https://www.npmjs.com/package/fastpriorityqueue) - very fast, includes comprehensive list nodejs heaps
- [qlist](https://www.npmjs.com/package/qlist) - very fast circular buffer
