define([], function () {
  'use strict';

  return {
    constructor: function () {
      // Listen for api/find calls, and update the text, if
      // it does not originate from this text box.
      socket.on('api/find', function (data) {
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
        socket.emit('api/find', {
          term: term,
          typed: true
        });
      }
    }
  };
});
