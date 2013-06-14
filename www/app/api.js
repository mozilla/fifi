/*jshint browser: true */
/*global define, console */

define(function (require) {
  var socket,
    io = require('socket.io'),
    events = require('events'),
    socketUrl = location.hash.indexOf('dev') === -1 ?
          'http://immense-reef-2130.herokuapp.com' :
          'http://127.0.0.1:5000';

  console.log('Using server: ' + socketUrl);

  socket = io.connect(socketUrl);

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    events.emit('api/suggestDone/' + data.engineId, data);
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);
    events.emit('api/queryDone/' + data.engineId, data);
  });

  // Listen for module events and convert to a server call.
  events.on('api/find', function (data) {
    socket.emit('api/find', { term: data.term });
  });

  // No export, rely on events instead.
});



