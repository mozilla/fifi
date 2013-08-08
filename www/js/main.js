define(['jquery', 'socket.io', 'base/find', 'base/autotag', 'base/utils', 'nunjucks', 'templates'],
  function ($, io, find, Autotag, utils, nunjucks) {
  'use strict';

  var wrapper = $('#wrapper');

  var io = require('socket.io');
  var socketUrl = 'http://127.0.0.1:5000';
  var socket = io.connect(socketUrl);
  var lastSearch;
  var lastTerm;
  var currResults = '';
  var suggestionsEl = wrapper.find('.suggestions');

  var autotag = new Autotag();

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    autotag.results = {};
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
      wrapper.find('.suggestions').append(
        nunjucks.env.getTemplate('results.html').render({
          results: results,
          found: results.length,
          engineId: data.engineId
        })
      );
      /*
      autotag.generate(results, data.engineId, function () {
        console.log('object -> ', JSON.stringify(autotag.results))
        suggestionsEl.append(
          nunjucks.env.getTemplate('results.html').render({
            results: autotag,
            found: utils.keySize(autotag.results),
            engineId: data.engineId
          })
        );
      });
*/
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
