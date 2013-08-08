define([], function () {
  'use strict';

  return {
    keySize: function (obj) {
      var size = 0, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          size ++;
        }
      }
      return size;
    }
  };
});
