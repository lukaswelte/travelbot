/* jshint node: true, devel: true */
'use strict';

const EventEmitter = require('events');
const emitter = new EventEmitter();

module.exports = {
    emit: (event, payload) => emitter.emit(event, payload),
    on: (event, callback) => emitter.on(event, callback),
    events: {
        "messageReceived": "messageReceived",
        "postbackReceived": "postbackReceived"
    }
};