/*jshint browser: true*/
define(function (require) {
  return require('app/element')({
    template: require('tmpl!./def.html'),
    constructor: function (node) {
        var id = node.dataset.engineid;
        this.on['api/queryDone' + (id ? '/' + id : '')] = function (data) {
          this.data = data.result;
          this.render();
        };;
    }
  });
});