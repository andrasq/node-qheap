qheap
=====

fast heap / priority queue / ordered list

Qheap is a classic heap.  It was written to be fast and efficient; it is 2-3x
faster than [heap](https://www.npmjs.com/package/heap) for 150 items or more.

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


Methods
-------

### new Heap( options )

create a new empty heap.

Options:

        compar  - comparison function to determine the item ordering.  The
                  function should return a value less than zero if the first
                  argument should be ordered before the second (compatible
                  with the function passed to `sort()`).
                  The default ordering if no compar is specified is by `<`:
                  `function(a,b){ return a < b ? -1 : 1 }`

### insert( item )

insert the item into the heap and rebalance the tree.  Item can be anything,
only the `compar` function needs to know the actual type.

### remove( )

remove and return the item at the root of the heap (the next item in the
sequence), and rebalance the tree.

### peek( )

return the item at the root of the heap, but do not remove it.

### length

the heap `length` property is the count of items currently in the heap.  This
is a read-only property, it must not be changed.


Related Work
------------

- [heap](https://www.npmjs.com/package/heap)
- [js-priority-queue](https://www.npmjs.com/package/js-priority-queue)
- [qlist](https://www.npmjs.com/package/qlist)
