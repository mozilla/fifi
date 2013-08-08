requirejs.config({
  deps: ['main'],
  paths: {
    'jquery': 'lib/jquery',
    'nunjucks': 'lib/nunjucks',
    'socket.io': 'lib/socket.io',
    'async': 'lib/async'
  },
  shim: {
    'jquery': {
      exports: 'jQuery'
    },
    'nunjucks': {
      exports: 'nunjucks'
    },
    'socket.io': {
      exports: 'io'
    }
  }
});
