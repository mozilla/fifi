/*jshint browser: true*/
/*global define*/

define(function (require) {
  var events = require('events');

  return require('app/element')({
    template: require('tmpl!./suggest.html'),
    constructor: function (node) {
      var id = node.dataset.engineid;
      this.on['api/suggestDone' + (id ? '/' + id : '')] = function (data) {

        // Convert data to a form to use in the HTML
        this.data = {
          term: data.result[0],
          main: data.result[1][0],
          others: {
            list: data.result[1].splice(1)
          }
        };

        this.render();
      };
    },
    on: {
      rendered: function () {
        // This is a bit wasteful since the node is redone for each render,
        // but wait for a web component future to fix.
        this.node.addEventListener('click', function (evt) {
          var term = evt.target.dataset.term;
          if (term) {
            events.emit('api/find', {
              term: term
            });
          }
        });
      }
    }
  });
});