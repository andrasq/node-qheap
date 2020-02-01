/**
 * Copyright (C) 2014-2020 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var assert = require('assert');

var Heap = require('./');

function insertArray( l, a ) {
    for (var i=0; i<a.length; i++) l.insert(a[i]);
}

module.exports = {
    setUp: function(done) {
        this.cut = new Heap();
        done();
    },

    'package.json should parse': function(t) {
        t.expect(1);
        var json = require('./package.json');
        t.ok(json.main);
        t.done();
    },

    'should expose insert/remove methods': function(t) {
        this.cut.insert(1);
        t.equal(this.cut.remove(), 1);
        t.done();
    },

    'should expose push/shift methods': function(t) {
        this.cut.push(1);
        t.equal(this.cut.shift(), 1);
        t.done();
    },

    'should construct both as function and as class': function(t) {
        var qheap = require('./');
        t.ok(qheap() instanceof Heap);
        t.ok(new qheap() instanceof Heap);
        t.done();
    },

    'empty heap should return undefined': function(t) {
        assert(this.cut.remove() === undefined);
        t.done();
    },

    'peek should return the first item or undefined': function(t) {
        this.cut.insert(2);
        t.equal(2, this.cut.peek());
        this.cut.insert(1);
        t.equal(1, this.cut.peek());
        this.cut.remove();
        t.equal(2, this.cut.peek());
        this.cut.remove();
        assert(this.cut.peek() === undefined);
        t.done();
    },

    'should update length on insert and remove': function(t) {
        t.equal(0, this.cut.length);
        this.cut.insert(1);
        t.equal(1, this.cut.length);
        this.cut.remove();
        t.equal(0, this.cut.length);
        t.done();
    },

    // TODO: deprecate size()
    'size should return length': function(t) {
        t.equal(this.cut.size(), 0);
        this.cut.push(1);
        t.equal(this.cut.size(), 1);
        this.cut.pop();
        t.equal(this.cut.size(), 0);
        t.done();
    },

    'heap should return lesser of two': function(t) {
        this.cut.insert(2);
        this.cut.insert(1);
        assert.equal(this.cut.remove(), 1);
        this.cut.insert(3);
        assert.equal(this.cut.remove(), 2);
        assert.equal(this.cut.remove(), 3);
        assert(this.cut.remove() === undefined);
        t.done();
    },

    'heap should use user-provided compar': function(t) {
        var h = new Heap({compar: function(a,b) { return a < b ? 1 : -1 }});
        h.insert(1);
        h.insert(2);
        assert.equal(h.remove(), 2);
        t.done();
    },

    'heap should use user-provided comparBefore': function(t) {
        var h = new Heap({comparBefore: function(a,b) { return b < a }});
        h.insert(1);
        h.insert(2);
        assert.equal(h.remove(), 2);
        t.done();
    },

    'should remove sorted elements in order': function(t) {
        var i, data = [ 1420347223875, 1420347223878, 1420347223879, 1420347223880, 1420347223918 ];
        this.cut.length = data.length;
        for (i=0; i<data.length; i++) this.cut._list[i+1] = data[i];
        for (i=0; i<data.length; i++) t.equal(this.cut.remove(), data[i]);
        t.done();
    },

    'should sort 3 items': function(t) {
        var datasets = [ [1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1] ];
        for (var i=0; i<datasets.length; i++) {
            var data = datasets[i];
            var q = new Heap({size: 4});
            for (var j=0; j<3; j++) q.insert(data[j]);
            t.equal(q.remove(), 1);
            t.equal(q.remove(), 2);
            t.equal(q.remove(), 3);
        }
        t.done();
    },

    'should sort the data': function(t) {
        if (process.env.NODE_COVERAGE) return t.done();
        var i, data = [580, 253, 610, 176];
        var nitems = 100000;
        for (i=0; i<nitems; i++) {
            data[i] = Math.random() * 1000 | 0;
            this.cut.insert(data[i]);
        }
        var ok = this.cut._check();
        t.ok(ok);
        t.equal(this.cut.length, data.length);
        // FIXME: this loop does not detect incorrect orderings...
        var item = this.cut.remove();
        for (i=1; i<nitems; i++) {
            var x = this.cut.remove();
            //assert(x >= item, i + ": " + x + " should be >= " + item);
            assert(x >= item);
            item = x;
        }
        t.equal(this.cut.remove(), undefined);
        t.equal(this.cut.length, 0);
        t.done();
    },

    'should convert toArray': function(t) {
        var l = new Heap();
        t.deepEqual(l.toArray(), []);
        l.insert(1);
        t.deepEqual(l.toArray(), [1]);
        l.insert(2);
        t.deepEqual(l.toArray().sort(), [1, 2]);
        l.insert(3);
        l.insert(4);
        t.deepEqual(l.toArray().sort(), [1, 2, 3, 4]);
        t.deepEqual(l.toArray(0).sort(), []);
        t.deepEqual(l.toArray(1).sort(), [1]);
        t.deepEqual(l.toArray(2).sort(), [1, 2]);
        t.done();
    },

    'should copy': function(t) {
        var l1 = new Heap();
        l1.push(1);
        l1.push(2);
        l1.push(3);
        l1.otherProperty = 123;
        var l2 = l1.copy();
        l2.pop();
        l2.push(0);
        t.deepEqual(l1.toArray().sort(), [1,2,3]);
        t.deepEqual(l2.toArray().sort(), [0,2,3]);
        t.strictEqual(l2.otherProperty, undefined);
        t.done();
    },

    'should sort': function(t) {
        var l1 = new Heap();
        l1.sort();
        t.deepEqual(l1.toArray(), []);

        l1.push(3);
        l1.sort();
        t.deepEqual(l1.toArray(), [3]);

        l1.push(2);
        l1.sort();
        t.deepEqual(l1.toArray(), [2, 3]);

        l1.push(1);
        t.deepEqual(l1.toArray(), [1, 3, 2]);
        l1.sort();
        t.deepEqual(l1.toArray(), [1, 2, 3]);
        t.equal(l1.shift(), 1);
        t.equal(l1.shift(), 2);
        t.equal(l1.shift(), 3);

        var l2 = new Heap();
        for (var i=0; i<1000; i++) l2.insert(Math.random());
        var timeit = require('qtimeit');
        timeit(1000, function() { l2.sort() });

        t.done();
    },

    'subsample': {
        'should subsample': function(t) {
            sampleit([], -1, 0);
            sampleit([], 0, 0);
            sampleit([], 1, 0);

            sampleit([1], 0, 0);
            sampleit([1], 1, 1);
            sampleit([1], 3, 1);
            sampleit([1, 2], 1, 1);
            sampleit([1, 2], 2, 2);

            sampleit([1, 2, 3, 4], -1, 0);
            sampleit([1, 2, 3, 4], 0, 0);
            sampleit([1, 2, 3, 4], 1, 1);
            sampleit([1, 2, 3, 4], 2, 2);
            sampleit([1, 2, 3, 4], 4, 4);
            sampleit([1, 2, 3, 4], 5, 4);
            sampleit([1, 2, 3, 4], 99, 4);

            h = new Heap();
            insertArray(h, [3, 2, 1]);
            t.deepEqual(h.subsample(3), [1, 3, 2]);
            t.deepEqual(h.subsample(3, { sort: true }), [1, 2, 3]);

            t.done();

            function sampleit(array, limit, length) {
                var h = new Heap();
                insertArray(h, array);
                for (var i=0; i<100; i++) {
                    var samp = h.subsample(limit).sort();
                    t.equal(samp.length, length);
                    t.contains(array, samp);
                }
            }
        },

        'should subsample fairly': function(t) {
            var h = new Heap();
            var counts = [];

            for (var i=1; i<10; i++) { h.insert(i); counts[i] = 0 }

            for (var i=0; i<100000; i++) {
                var samp = h.subsample(2);
                counts[samp[0]] += 1;
                counts[samp[1]] += 1;
            }
            var min = Math.min.apply(null, counts.slice(1));
            var max = Math.max.apply(null, counts.slice(1));
            // no more than 1% over 100k
            t.ok(max - min < 1000);
            t.done();
        },
    },

    'gc': {

        'should always gc if no options': function(t) {
            var h = new Heap();
            h.push(1);
            h.gc();
            t.equal(h._list.length, 2);
            t.done();
        },

        'should gc if meet options': function(t) {
            var h = new Heap({ size: 10 })
            h.gc({ minLength: 0, minFull: 0.00001 });
            t.equal(h._list.length, 1);     // list[0] is always present but is unused
            t.done();
        },

        'should not gc if list is too small': function(t) {
            var h = new Heap({ size: 10 });
            h.gc({ minLength: 100 });
            t.equal(h._list.length, 10);
            t.done();
        },

        'should not gc if list utilization is high': function(t) {
            var h = new Heap();
            for (var i=0; i<20001; i++) h.push(i);
            for (var i=0; i<5000; i++) h.shift();
            h.gc({ minFull: 0.50 });
            t.equal(h._list.length, 20002);
            t.done();
        },

    },

    'options': {
        'should accept comparator': function(t) {
            var compar = t.spy();
            var h = new Heap(compar);
            h.push(1);
            h.push(2);
            t.equal(compar.stub.callCount, 1);
            t.done();
        },

        'should accept comparBefore': function(t) {
            var cmp = function(){};
            var h = new Heap({ comparBefore: cmp });
            t.equal(h._isBefore, cmp);
            t.done();
        },

        'should accept size': function(t) {
            var h = new Heap({ size: 3 });
            t.equal(h._list.length, 3);
            t.done();
        },

        'should accept freeSpace': function(t) {
            var h = new Heap({ freeSpace: true });
            t.ok(h._freeSpace);
            t.done();
        },

        'if freeSpace should try to free on remove': function(t) {
            var h = new Heap({ freeSpace: true });
            var spy = t.spy(h, '_freeSpace');
            h.push(1);
            h.push(2);
            h.remove();
            t.equal(spy.callCount, 1);
            t.done();
        },

        'should always set _isBefore': function(t) {
            var fn = function(){};
            var h1 = new Heap();
            t.equal(typeof h1._isBefore, 'function');
            var h2 = new Heap(fn);
            t.equal(typeof h2._isBefore, 'function');
            t.ok(h2._isBefore != fn);
            var h3 = new Heap({ compar: fn });
            t.equal(typeof h3._isBefore, 'function');
            t.ok(h3._isBefore != fn);
            var h4 = new Heap({ comparBefore: fn });
            t.equal(h4._isBefore, fn);
            t.done();
        },
    },

    'helpers': {
        '_trimArraySize should do nothing if array is small': function(t) {
            var h = new Heap();
            var list = new Array(100);
            list[0] = 1234;
            list[99] = 99;
            h._trimArraySize(list, 1);
            t.equal(list.length, 100);
            t.equal(list[0], 1234);
            t.equal(list[99], 99);
            t.done();
        },

        '_trimArraySize should trim if array too large': function(t) {
            var h = new Heap();
            var list = new Array(40005);
            list[0] = 1234;
            list[10001] = 567;
            h._trimArraySize(list, 10001);
            t.equal(list.length, 10002);
            t.equal(list[0], 1234);
            t.equal(list[10001], 567);
            t.done();
        },

        '_check should flag invalid heap': function(t) {
            var h = new Heap();
            var h2 = new Heap();
            h.push(1); h2.push(1);
            h.push(2); h2.push(2);
            // break h
            h._list[1] = 2;
            h._list[2] = 1;
            var stub = t.stub(console, 'log');
            var ok = h._check();
            var good = h2._check();
            stub.restore();
            t.assert(!ok);
            t.assert(good);
            t.done();
        },
    },

    'fuzz test': function(t) {
        if (process.env.NODE_COVERAGE) return t.done();
        for (var nitems=2; nitems<8; nitems++) {
            for (var loop=0; loop<20000; loop++) {
                var cut = new Heap({size: 4});
                for (var i=0; i<nitems; i++) {
                    // bubbles up new value into correct position after insert
                    cut.insert((Math.random() * 1000 + 1) >> 0);
                    t.ok(cut._check());
                    t.ok(cut.length, i+1);
                }
                for (var i=0; i<nitems; i++) {
                    // bubbles down last element into correct position after remove
                    cut.remove();
                    t.ok(cut._check(), "removing item #" + (i+1) + " with nitems " + nitems);
                }
            }
        }
        t.done();
    },
};
