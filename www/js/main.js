define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils', 'nunjucks', 'templates'],
  function ($, io, find, Autoset, utils, nunjucks) {
  'use strict';

  var wrapper = $('#wrapper');

  var io = require('socket.io');
  var socketUrl = 'http://127.0.0.1:5000';
  var socket = io.connect(socketUrl);
  var lastSearch;
  var lastTerm;
  var currResults = '';
  var suggestionsEl = wrapper.find('.suggestions');

  var autoset = new Autoset();

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    autoset.results = {};
    socket.emit('api/suggestDone/' + data.engineId, data);

    var results = data.result[1];

    if (results === 'undefined') {
      wrapper.find('.suggestions').append(
        nunjucks.env.getTemplate('results.html').render({
          results: {},
          found: 0,
          engineId: false
        })
      );
    } else {
      autoset.generate(results, data.engineId, function () {
        wrapper.find('.suggestions').html(
          nunjucks.env.getTemplate('results.html').render({
            results: autoset.results,
            found: utils.keySize(autoset.results),
            engineId: data.engineId
          })
        );
      });
    }
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
    autoset.results = {};
    var value = $(ev.target).val().toString().trim();
    wrapper.find('.suggestions').empty();

    if (value.length > 0) {
      lastTerm = value;
      setTimeout(function () {
        socket.emit('api/find', { term: value });
      }, 1);
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
