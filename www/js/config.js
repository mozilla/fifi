requirejs.config({
  deps: ['main'],
  paths: {
    'jquery': 'lib/jquery',
    'nunjucks': 'lib/nunjucks',
    'socket.io': 'lib/socket.io',
    'async': 'lib/async',
    'moment': 'lib/moment',
    'debounce': 'lib/debounce'
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
    },
    'debounce': [
      'jquery'
    ]
  }
});
