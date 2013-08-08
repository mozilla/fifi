define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils', 'nunjucks', 'templates', 'async!//maps.googleapis.com/maps/api/js?sensor=true'],
  function ($, io, find, Autoset, utils, nunjucks) {
  'use strict';

  var wrapper = $('#wrapper');

  var geocoder = new google.maps.Geocoder();
  var haveLocation = false;
  var lastLocation = "";

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

  function geolocationSuccess (position) {
    // borrowed from
    // https://gist.github.com/larryrubin/2593322#file-phonegap_reverse_geo_lookup-html
    var lat = parseFloat(position.coords.latitude);
    var lng = parseFloat(position.coords.longitude);
    var latlng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK && results) {
        $.each(results, function (i, address) {
          if (address.types[0] == "postal_code") {
            lastLocation = address.formatted_address;
            haveLocation = true;
            wrapper.find("#geolocation-name").text(lastLocation);
            return false; // break
          }
        });
      } else {
        console.log("Geocoder failed due to: " + status);
      }
    });
  }
  function geolocationError() {
    console.log("error with geolocation");
  }

  wrapper.find('#fifi-find').on('focus', function (ev) {
    wrapper.find('#fifi-find-box').addClass('fifi-find-box-focused').find('#geolocation-box').addClass('geolocation-box-focused');
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

      case 'geolocation':
        if (navigator.geolocation) {
          if (haveLocation) {
            if (confirm("Would you like to turn off location?")) {
              wrapper.find('#geolocation-name').text('Location');
              lastLocation = "";
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
