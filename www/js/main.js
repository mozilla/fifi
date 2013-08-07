define(['jquery', 'socket.io', 'base/find', 'nunjucks', 'templates'],
  function ($, io, find, nunjucks) {
  'use strict';

  var wrapper = $('#wrapper');

  var io = require('socket.io');
  var socketUrl = 'http://127.0.0.1:5000';
  var socket = io.connect(socketUrl);
  var lastSearch;
  var lastTerm;

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    socket.emit('api/suggestDone/' + data.engineId, data);
    wrapper.find('.suggestions').html(
      nunjucks.env.getTemplate('results.html').render({
        results: data.result[1]
      })
    );
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);
    socket.emit('api/queryDone/' + data.engineId, data);
  });

  // Load initial search template
  wrapper.find('#search').html(
    nunjucks.env.getTemplate('suggest.html').render()
  );

  wrapper.on('keyup', '#fifi-find', function (ev) {
    ev.preventDefault();

    var value = $(ev.target).val().toString().trim();

    if (value.length > 0) {
      //autotag.generate(value);
      socket.emit('api/find', { term: '"' + value + '"' });
    } else {
      wrapper.find('.suggestions').empty();
    }
  });

  wrapper.on('touchstart click', function (ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      case 'concept':
        lastSearch = wrapper.html();
        lastTerm = self.data('term');
        wrapper.find('#search').html(
          nunjucks.env.getTemplate('details.html').render({
            term: lastTerm
          })
        );
        break;

      case 'back':
        wrapper.html(lastSearch);
        wrapper.find('#fifi-find').val(lastTerm);
        break;
    };
  });
});
