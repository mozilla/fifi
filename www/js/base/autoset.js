define(['./utils'], function (utils) {
  'use strict';

  var Autoset = function () {
    var self = this;

    this.engineClear = function () {
      this.results = {};
      this.terms = null;
      this.engines = {
        'bing.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'amazon.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'yelp.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'en.wikipedia.org': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'twitter.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'foursquare.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
        'boxfish.com': {
          conceptsPrimary: [],
          conceptsSecondary: []
        },
      };
    };

    this.engineClear();

    this.generate = function (terms, value, engineId, callback) {
      if (this.terms === null) {
        this.terms = terms;
      }

      if (value && this.terms === terms) {
        var count = 0;

        for (var i = 0, val; val = value[i]; i += 1) {
          count ++;

          val = val.toString().toLowerCase();

          if (!this.results[val] && val.length > 0 && this.engines[engineId].conceptsPrimary.length < 3) {
            this.results[val] = true;
            this.engines[engineId].conceptsPrimary.push({
              concept: val
            });
          }

          if (count === value.length - 1) {
            callback(true);
          }
        }
      }
    };

    this.generateSecondary = function (terms, value, engineId, callback) {
      if (this.terms === null) {
        this.terms = terms;
      }

      if (value && this.terms === terms) {
        var count = 0;

        for (var i = 0, val; val = value[i]; i += 1) {
          count ++;

          val = val.toString().toLowerCase();

          if (!this.results[val] && val.length > 0 && this.engines[engineId].conceptsSecondary.length < 3) {
            this.results[val] = true;
            this.engines[engineId].conceptsSecondary.push({
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
