/*jshint browser: true*/
define(function (require) {
  return require('app/element')({
    template: require('tmpl!./suggest.html'),
    constructor: function (node) {
        var id = node.dataset.engineid;
        this.on['api/suggestDone' + (id ? '/' + id : '')] = function (data) {
          this.data = {
            term: data.result[0],
            main: data.result[1][0],
            others: data.result[1].splice(1)
          };

          this.render();
        };
    }
  });
});