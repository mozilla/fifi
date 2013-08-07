/*jshint browser: true*/
define(function (require) {
  return require('app/element')({
    template: require('tmpl!./def.html'),
    constructor: function (node) {
      var id = node.dataset.engineid;
      this.on['api/queryDone' + (id ? '/' + id : '')] = function (data) {

        // This assumes wikipedia data at the moment
        var value = data.result;

        this.data = {};

        if (value) {
          this.data = {
            html: value
          };
        }

        this.render();
      };;
    }
  });
});
