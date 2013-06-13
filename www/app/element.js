/*jshint browser: true */
/*global define */

define(function (require) {
  var events = require('events'),
      tempNode = document.createElement('div');

  function Element(node) {
    if (!node) {
      return;
    }

    if (!this.data) {
      this.data = {};
    }
    this.node = node;

    if (this.on) {
      Object.keys(this.on).forEach(function (key) {
        if (this.on[key] === true) {
          // Just rerender the template.
          events.on(key, function (data) {
            this.data = data;
            this.render();
          }.bind(this));
        } else {
          events.on(key, this.on[key].bind(this));
        }
      }.bind(this));
    }

    this.render();
  }

  Element.prototype = {
    render: function () {
      var newNode,
          html = this.template(this.data);

      tempNode.innerHTML = html;
      newNode = tempNode.children[0];
      tempNode.innerHTML = '';
      this.node.parentNode.replaceChild(newNode, this.node);
      this.node = newNode;
      if (this.on.rendered) {
        this.on.rendered.call(this);
      }
    }
  };

  return function makeElement(obj) {
    function Ctor() {
      if (!this.on) {
        this.on = {};
      }

      if (obj.constructor) {
        obj.constructor.apply(this, arguments);
      }
      Element.apply(this, arguments);
    }

    Ctor.prototype = new Element();

    Object.keys(obj).forEach(function (key) {
      Ctor.prototype[key] = obj[key];
    });

    return Ctor;
  };
});