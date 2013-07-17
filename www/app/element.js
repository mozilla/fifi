/*jshint browser: true */
/*global define */

define(function (require) {
  var events = require('events'),
      tempNode = document.createElement('div'),
      slice = Array.prototype.slice;

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
      // Skip if no template associated, just binds to existing HTML
      if (!this.template) {
        return;
      }

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

  // init function that converts elements to components.
  function init() {
    // Create tags.
    var nodes = slice.call(document.getElementsByTagName('body')[0].querySelectorAll('*'), 0);
    nodes.forEach(function (node) {
      var name = node.nodeName.toLowerCase();
      if (name.indexOf('fifi-') === 0) {
        require([name.replace(/-/g, '/')], function (Element) {
          new Element(node);
        });
      }
    });
  }

  if (document.readyState === 'complete') {
    setTimeout(init);
  } else {
    document.addEventListener('DOMContentLoaded', init, false);
  }

  // Creates an element constructor. Used by "subclasses".
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