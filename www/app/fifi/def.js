/*jshint browser: true*/
define(function (require) {
  return require('app/element')({
    template: require('tmpl!./def.html'),
    constructor: function (node) {
        var id = node.dataset.engineid;
        this.on['api/queryDone' + (id ? '/' + id : '')] = function (data) {


          // This assumes wikipedia data at the moment
          var key,
              query = data.result.query,
              value = query && query.pages;

          this.data = {};

          if (value) {
            key = Object.keys(value)[0];
            if (key) {
              value = value[key];
              value = value.revisions &&
                      value.revisions[0] &&
                      value.revisions[0]['*'];
              if (value) {
                this.data = {
                  html: value
                };
              }
            }
          }

          this.render();
        };;
    }
  });
});