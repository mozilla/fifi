define(['jquery', 'async!//maps.googleapis.com/maps/api/js?sensor=true'], function ($) {
  'use strict';

  var storage = window.localStorage;

  // stored values for storage.haveRequestedLocation
  var PERMISSION_GRANTED = "GRANTED",
      PERMISSION_DENIED = "DENIED";

  var geocoder = new google.maps.Geocoder();

  var haveCurrentPosition = false;

  var lastLocation = '';
  var lastPosition = null;
  var $node;

  var eventObject = new Object();

  // ID for watchCurrentPosition() call
  var watchId = null;

  function geolocationSuccess (position) {
    storage.haveRequestedLocation = PERMISSION_GRANTED;

    lastPosition = position;

    // borrowed from
    // https://gist.github.com/larryrubin/2593322#file-phonegap_reverse_geo_lookup-html
    var lat = parseFloat(position.coords.latitude);
    var lng = parseFloat(position.coords.longitude);

    $(eventObject).trigger('geolocation');

    geocoder.geocode({ 'latLng': new google.maps.LatLng(lat, lng) }, function (results, status) {
      if (results && status === google.maps.GeocoderStatus.OK) {
        $.each(results, function (i, address) {
          if (address.types[0] === 'locality') {
            haveCurrentPosition = true;
            lastLocation = address.formatted_address;
            setNodeText(lastLocation);
            return false; // break
          }
        });
      } else {
        console.log('Geocoder failed due to: ' + status);
      }
    });
  }

  function geolocationError(err) {
    switch (err.code) {
      case 1:
        storage.haveRequestedLocation = PERMISSION_DENIED;
        break;
      case 2:
        // position unavailable, try again?
        break;
      case 3:
        // timeout
        break;
    }
    console.error(err.message);
  }

  function setNodeText(text) {
    if ($node !== null) {
      $node.text(text);
    }
  }

  return {
    startWatchingPosition : function (obj) {
      if ("geolocation" in navigator) {
        if (!this.isWatchingPosition()) {
          $node = obj;
          watchId = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError);
        }
      }
    },
    stopWatchingPosition: function () {
      if ("geolocation" in navigator) {
        if (this.isWatchingPosition()) {
          if (confirm('Would you like to turn off your location?')) {
            navigator.geolocation.clearWatch(watchId);
            setNodeText('Location');
            lastLocation = '';
            haveCurrentPosition = false;
            watchId = null;
            $node = null;
          }        
        }
      }
    },
    isWatchingPosition: function () {
      return (watchId !== null);
    },
    hasCurrentPosition: function () {
      return (haveCurrentPosition === true);
    },
    clearCurrentPosition: function () {
      if (this.hasCurrentPosition()) {
        if (confirm('Would you like to turn off your location?')) {
          setNodeText('Location');
          lastLocation = '';
          haveCurrentPosition = false;
        }        
      }
    },
    getLastLocation: function () {
      return lastLocation;
    },
    getLastPosition: function () {
      return lastPosition;
    },
    getCurrentPosition: function (obj) {
      if ("geolocation" in navigator) {
        if (!this.hasCurrentPosition()) {
          $node = obj;
          navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
        }
      }
    },
    haveGeolocationPermission: function () {
      return (typeof storage.haveRequestedLocation !== 'undefined' && storage.haveRequestedLocation === PERMISSION_GRANTED);
    },
    on: function(name, callback) {
      $(eventObject).on(name, callback);
    },
    off: function(name, callback) {
      $(eventObject).off(name, callback);
    },
    trigger: function(name) {
      $(eventObject).trigger(name);
    }
  };
});