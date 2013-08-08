define([], function () {
  'use strict';

  var Autoset = function () {
    var self = this;

    this.results = {};

    this.generate = function (value, engineId, callback) {
      if (value) {
        value = value.toString().toLowerCase().trim().split(',');
        var count = 0;

        for (var i = 0; i < value.length; i ++) {
          count ++;
          if (!this.results[value[i]]) {
            this.results[value[i]] = {
              'searchEngines': {
                'amazon.com': {},
                'google.com': {},
                'yelp.com': {},
                'en.wikipedia.org': {}
              }
            };
          }

          if (count === value.length - 1) {
            callback(true);
          }
        }
      }
    };
  };

  return Autoset;
});
