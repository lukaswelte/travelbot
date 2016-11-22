/* jshint node: true, devel: true */
'use strict';

const store = {};

module.exports = {
    add: (id, proposal) => { store[id] = proposal },
    get: (id) => { return store[id]; }
};