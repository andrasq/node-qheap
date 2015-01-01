var assert = require('assert');

var Heap = require('../index.js');

module.exports = {
    setUp: function(done) {
        this.cut = new Heap();
        done();
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

    'should sort the data': function(t) {
        var i, data = [580, 253, 610, 176];
        for (i=0; i<100000; i++) data[i] = Math.random() * 1000 | 0;
        for (var i in data) {
            this.cut.put(data[i]);
        }
        var ok = this.cut._check();
        t.ok(ok);
        t.done();
    },
};
