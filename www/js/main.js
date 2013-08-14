define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils',
  'nunjucks', 'templates', 'async!//maps.googleapis.com/maps/api/js?sensor=true'],
  function ($, io, find, Autoset, utils, nunjucks, templates) {
  'use strict';

  var wrapper = $('#wrapper');

  var geocoder = new google.maps.Geocoder();
  var haveLocation = false;
  var inResults = false;
  var lastLocation = '';
  var io = require('socket.io');
  var socketUrl = location.hash.indexOf('dev') === -1 ?
    'http://immense-reef-2130.herokuapp.com' :
    'http://127.0.0.1:5000';
  var socket = io.connect(socketUrl);
  var lastEngine;
  var lastTerm;

  var autoset = new Autoset();

  nunjucks.configure('/templates', { autoescape: true });

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    socket.emit('api/suggestDone/' + data.engineId, data);

    var results = data.result;

    if (results === 'undefined') {
      nunjucks.render('results.html', {
        engineSet: {},
        found: 0
      }, function (err, res) {
        wrapper.find('.suggestions').append(res);
      });
    } else {
      autoset.generate(results, data.engineId, function () {
        nunjucks.render('results.html', {
          engineSet: autoset.engines,
          found: utils.keySize(autoset.engines)
        }, function (err, res) {
          wrapper.find('.suggestions').html(res);
        });
      });
    }
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);

    var engine = autoset.engines[lastEngine];

    for (var i = 0; i < engine.concepts.length; i ++) {
      if (engine.concepts[i].concept === data.term) {
        nunjucks.render('result.html', {
          engineId: data.engineId
        }, function (err, res) {
          wrapper.find('#details').append(res);

          var iframe = wrapper.find('#details li[data-engine="' + data.engineId + '"] iframe')[0]
                              .contentWindow.document;
          iframe.open();
          iframe.write(data.result);
          iframe.close();
        });

        break;
      }
    }
  });

  // Load initial search template
  nunjucks.render('suggest.html', function (err, res) {
    wrapper.find('#suggestions').html(res)
  });

  wrapper.on('keyup', '#fifi-find', function (ev) {
    ev.preventDefault();
    autoset.results = {};

    var value = $(ev.target).val().toString();

    autoset.engineClear();
    wrapper.find('.suggestions').empty();

    if (value.length > 0) {
      lastTerm = value;
      setTimeout(function () {
        socket.emit('api/find', { term: value, location: lastLocation });
      }, 1);
    } else {
      wrapper.find('.suggestions').empty();
    }
  });

  function geolocationSuccess (position) {
    // borrowed from
    // https://gist.github.com/larryrubin/2593322#file-phonegap_reverse_geo_lookup-html
    var lat = parseFloat(position.coords.latitude);
    var lng = parseFloat(position.coords.longitude);
    var latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
      if (results && status === google.maps.GeocoderStatus.OK) {
        $.each(results, function (i, address) {
          if (address.types[0] === 'postal_code') {
            lastLocation = address.formatted_address;
            haveLocation = true;
            wrapper.find('#geolocation-name').text(lastLocation);
            return false; // break
          }
        });
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
  }

  function geolocationError() {
    console.log("error with geolocation");
  }

  wrapper.find('#fifi-find').one('focus', function () {
    wrapper.find('#fifi-find-box')
           .addClass('fifi-find-box-focused')
           .find('#geolocation-box')
           .addClass('geolocation-box-focused');
    if (navigator.geolocation) {
      if (!haveLocation) {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
      }
    }
  });

  function goBack() {
    wrapper.find('#details').hide();
    wrapper.find('#suggestions').show();
    // reset original search terms
    wrapper.find('#fifi-find').val(lastTerm);
    inResults = false;
  }

  wrapper.find('#fifi-find').on('focus', function () {
    if (inResults) {
      goBack();
    }
  });

  wrapper.on('touchstart click', function (ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      case 'concept':
        wrapper.find('#suggestions').hide();
        lastEngine = self.data('engine');
        // save the current terms
        lastTerm = wrapper.find('#fifi-find').val();
        // set suggested terms as current
        wrapper.find('#fifi-find').val(self.data('term'));

        for (var engine in autoset.engines) {
          socket.emit('api/query', { 
            term: self.data('term'),
            location: lastLocation,
            engineId: engine
          });
        }

        nunjucks.render('details.html', { term: self.data('term') }, function (err, res) {
          inResults = true;
          wrapper.find('#details').html(res).show();
        });
        break;

      case 'back':
        goBack();
        break;

      case 'geolocation':
        if (navigator.geolocation) {
          if (haveLocation) {
            if (confirm('Would you like to turn off location?')) {
              wrapper.find('#geolocation-name').text('Location');
              lastLocation = '';
              haveLocation = false;
            }
          } else {
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
          }
        }
        break;
    };
  });
});
