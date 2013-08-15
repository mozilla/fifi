define(['./utils'], function (utils) {
  'use strict';

  var Autoset = function () {
    var self = this;

    this.results = {};
    this.engines = {
      'google.com': {
        concepts: []
      },
      'amazon.com': {
        concepts: []
      },
      'yelp.com': {
        concepts: []
      },
      'en.wikipedia.org': {
        concepts: []
      }
    };

    this.engineClear = function () {
      this.engines = {
        'google.com': {
          concepts: []
        },
        'amazon.com': {
          concepts: []
        },
        'yelp.com': {
          concepts: []
        },
        'en.wikipedia.org': {
          concepts: []
        }
      };
    };

    this.generate = function (value, engineId, callback) {
      if (value) {
        var count = 0;

        for (var i = 0, val; val = value[i]; i += 1) {
          count ++;

          val = val.toString().toLowerCase();

          if (!this.results[val] && val.length > 0 && this.engines[engineId].concepts.length < 3) {
            this.results[val] = true;
            this.engines[engineId].concepts.push({
              concept: val
            });
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
