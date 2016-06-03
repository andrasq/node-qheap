qheap
=====

heap / priority queue / ordered list

Qheap is a classic heap.

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


Related Work
------------

- [heap](https://www.npmjs.com/package/heap) - the classic, but slow
- [js-priority-queue](https://www.npmjs.com/package/js-priority-queue) - fast
- [fastpriorityqueue](https://www.npmjs.com/package/fastpriorityqueue) - very fast
- [qlist](https://www.npmjs.com/package/qlist)
