/**
 * Copyright (C) 2014 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var assert = require('assert');

var Heap = require('../index.js');

module.exports = {
    setUp: function(done) {
        this.cut = new Heap();
        done();
    },

    'package.json should parse': function(t) {
        t.expect(1);
        var json = require('../package.json');
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

    'empty heap should return null': function(t) {
        assert.equal(this.cut.remove(), null);
        t.done();
    },

    'heap should return lesser of two': function(t) {
        this.cut.insert(2);
        this.cut.insert(1);
        assert.equal(this.cut.remove(), 1);
        this.cut.insert(3);
        assert.equal(this.cut.remove(), 2);
        assert.equal(this.cut.remove(), 3);
        assert.equal(this.cut.remove(), null);
        t.done();
    },

    'heap should use user-provided compar': function(t) {
        var h = new Heap({compar: function(a,b) { return a < b ? 1 : -1 }});
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

    'should sort the data': function(t) {
        var i, data = [580, 253, 610, 176];
        for (i=0; i<100000; i++) {
            data[i] = Math.random() * 1000 | 0;
            this.cut.insert(data[i]);
        }
        var ok = this.cut._check();
        t.ok(ok);
        t.equal(this.cut.length, data.length);
        // FIXME: this loop does not detect incorrect orderings...
        var item = this.cut.remove();
        while (this.cut.peek() !== undefined) { var x = this.cut.remove(); assert(x >= item); item = x; }
        t.equal(this.cut.length, 0);
        t.done();
    },
};
