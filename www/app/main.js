/*jshint browser: true */
/*global define, console */

define(function (require) {
  var queryNode, socket,
    captureTimeoutId = 0,
    io = require('socket.io'),
    events = require('events'),
    socketUrl = location.hash.indexOf('dev') === -1 ?
          'http://immense-reef-2130.herokuapp.com' :
          'http://127.0.0.1:5000';

  console.log('Using server: ' + socketUrl);

  socket = io.connect(socketUrl);

  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    events.emit('api/suggestDone/' + data.engineId, data);
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);
    events.emit('api/queryDone/' + data.engineId, data);
  });

  function capture() {
    captureTimeoutId = 0;
    var term = queryNode.value.trim();

    if (term) {
      console.log('term is: ' + term);
      socket.emit('api/find', { term: term });
    }
  }

  function init() {
    queryNode = document.querySelector('.query');

    queryNode.addEventListener('keyup', function () {
      if (!captureTimeoutId) {
        captureTimeoutId = setTimeout(capture, 300);
      }
    }, false);

    // Create tags.
    var nodes = Array.slice(document.getElementsByTagName('body')[0].querySelectorAll('*'), 0);
    nodes.forEach(function (node) {
      var name = node.nodeName.toLowerCase();
      if (name.indexOf('fifi-') === 0) {
        require([name.replace(/-/g, '/')], function (Element) {
          new Element(node);
        });
      }
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, false);
  }
});