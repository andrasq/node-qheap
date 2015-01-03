qheap
=====

fast heap / priority queue / ordered list

Qheap is a classic heap.  It's fairly quick, 5x faster than
[heap](https://www.npmjs.com/package/heap) for larger data sets.

A heap is partially ordered balanced binary tree with the property that the
value at the root comes before any value in either the left or right subtrees.
It supports two operations, insert and remove, both O(log n) (and peek, O(1)).
The tree can be efficiently mapped into an array: the root at offset `[1]` and
each node at `[n]` having children left at `[2*n]` and right at `[2*n + 1]`.

        var Heap = require('qheap');
        var h = new Heap({compar: function(a, b) { return a < b ? -1 : 1; }});
        h.insert('c');
        h.insert('a');
        h.insert('b');
        h.remove();     // => 'a'


Installation
------------

        npm install qheap
        npm test qheap


Benchmark
---------

        Heap = require('qheap');
        nloops = 100000;

        function fptime() { t = process.hrtime(); return t[0] * 1000 + t[1] * 1e-6; }
        for (i=0; i<1000; i++) x = fptime();

        // for (i=0; i<nloops; i++) q = new Heap();    // churn?

        q = new Heap();
        t1 = fptime();
        for (i=0; i<nloops; i++) q.insert(Math.random() * 1000000 | 0);
        for (i=0; i<nloops; i++) x = q.remove();
        t2 = fptime();

        // measured times, in ms:
        //                      1k      10k     100k    1m      10m
        // qheap                0.76    3.28    14.9    85      910
        // heap                 1.96    4.13    29.3    425     7100
        // js-priority-queue    1.97    4.81*   36.3*   445*    7200

* - js-priority-queue is sensitive to the state of gc.  If the line marked `//
churn?` is commented in, runtimes increase 65%

Api
---

### new Heap( options )

create a new empty heap.

Options:

`compar` : comparison function to determine the item ordering.  The function
should return a value less than zero if the first argument should be ordered
before the second (compatible with the function passed to `sort()`).  The
default ordering if no compar is specified is by `<`:  `function(a,b){ return
a < b ?  -1 : 1 }`

`freeSpace` : when the heap shrinks to 1/4 its high-water mark, reallocate the
storage space to free the unused memory, and reset the high-water mark.
Default is false, avoiding the overhead of the array slice.  Note: freeing
space from the array halves the insert rate; use advisedly.

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


Related Work
------------

- [heap](https://www.npmjs.com/package/heap)
- [js-priority-queue](https://www.npmjs.com/package/js-priority-queue)
- [qlist](https://www.npmjs.com/package/qlist)
