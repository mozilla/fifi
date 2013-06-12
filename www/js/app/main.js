/*jshint browser: true */
/*global define, console */

define(function (require) {
    var queryNode, socket,
        captureTimeoutId = 0,
        io = require('socket.io');

    //socket = io.connect('http://immense-reef-2130.herokuapp.com');
    socket = io.connect('http://127.0.0.1:5000');

    socket.on('api/suggested', function (data) {
        console.log('GOT api/suggested: ', data);
    });

    function capture() {
        captureTimeoutId = 0;
        var term = queryNode.value.trim();
        console.log('term is: ' + term);
        socket.emit('api/suggest', { term: term });
    }

    function init() {
        queryNode = document.querySelector('.query');

        queryNode.addEventListener('keyup', function () {
            if (!captureTimeoutId) {
                captureTimeoutId = setTimeout(capture, 300);
            }
        }, false);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init, false);
    }
});