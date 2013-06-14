/*jshint browser: true*/
/*global define */
define(function (require) {
  var events = require('events');

  return require('app/element')({
    template: require('tmpl!./find.html'),
    constructor: function () {
      // Listen for api/find calls, and update the text, if
      // it does not originate from this text box.
      events.on('api/find', function (data) {
        if (!data.typed) {
          this.node.value = data.term;
        }
      }.bind(this));
    },

    on: {
      rendered: function () {
        this.node.addEventListener('keyup', function () {
          if (!this.captureTimeoutId) {
            this.captureTimeoutId = setTimeout(this.capture.bind(this), 300);
          }
        }.bind(this), false);
      }
    },

    capture: function capture() {
      this.captureTimeoutId = 0;
      var term = this.node.value.trim();

      if (term) {
        console.log('term is: ' + term);
        events.emit('api/find', {
          term: term,
          typed: true
        });
      }
    }
  });
});

