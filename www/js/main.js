define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils',
  'base/geo', 'nunjucks', 'templates'],
  function ($, io, find, Autoset, utils, geo, nunjucks, templates) {
  'use strict';

  var wrapper = $('#wrapper');

  var inResults = false;
  var socketUrl = location.hash.indexOf('dev') === -1 ?
    'http://clark-fifi.herokuapp.com/' :
    'http://127.0.0.1:5000';
  var socket = io.connect(socketUrl);
  var lastEngine;
  var lastTerm;

  var autoset = new Autoset();

  nunjucks.configure('/templates', { autoescape: true });

  // Listen for data from server and convert to module events
  socket.on('api/suggestDone', function (data) {
    console.log('GOT api/suggestDone: ', data);
    socket.emit('api/suggestDone/' + data.engineId, data);

    var results = data.result;

    if (results === 'undefined') {
      nunjucks.render('results.html', {
        engineSet: {},
        found: 0
      }, function (err, res) {
        wrapper.find('.suggestions').append(res);
      });
    } else {
      autoset.generate(results, data.engineId, function () {
        nunjucks.render('results.html', {
          engineSet: autoset.engines,
          found: utils.keySize(autoset.engines)
        }, function (err, res) {
          wrapper.find('.suggestions').html(res);
        });
      });
    }
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);

    var engine = autoset.engines[lastEngine];

    for (var i = 0; i < engine.concepts.length; i ++) {
      if (engine.concepts[i].concept === data.term) {
        nunjucks.render('result.html', {
          engineId: data.engineId
        }, function (err, res) {
          wrapper.find('#details-list').append(res);
          var defList = wrapper.find('#definition-links');
          var defVideos = wrapper.find('#definition-videos');

          switch (data.engineId) {
            case 'google.com':
              var link = data.result && data.result.items;

              if (link) {
                var list = data.result.items, rest = [];

                for (var index = 0, item; item = list[index]; index += 1) {
                  if ('en.wikipedia.org' === item.displayLink) {
                    defList.append(
                      $('<li/>').append(
                        $('<a/>').text(item.title.replace(' - Wikipedia, the free encyclopedia', ' on Wikipedia')).attr('href', item.link)
                        )
                      );
                  } else if ('twitter.com' === item.displayLink) {
                    defList.append(
                      $('<li/>').append(
                        $('<a/>').text(item.link.replace(/http(s)?:\/\/twitter\.com\//,'') + ' on Twitter').attr('href', item.link)
                        )
                      );
                  // locate a vimeo user account
                  } else if ('vimeo.com' === item.displayLink) {
                    defList.append(
                      $('<li/>').append(
                        $('<a/>').text(item.title).attr('href', item.link)
                        )
                      );
                  // Locate a facebook page for result
                  } else if ('www.facebook.com' === item.displayLink) {
                    defList.append(
                      $('<li/>').append(
                        $('<a/>').text(item.title.replace('| Facebook', 'on Facebook')).attr('href', item.link)
                        )
                      );
                  // find a YouTube user account
                  } else if (item.formattedUrl.indexOf('www.youtube.com/user/') === 0) {
                    defList.append(
                      $('<li/>').append(
                        $('<a/>').text(item.title.replace('- YouTube', ' on YouTube')).attr('href', item.link)
                        )
                      );
                  // this will just find youtube videos that might be useful
                  } else if ('www.youtube.com' === item.displayLink) {
                    defVideos.append(
                      $('<li/>').append(
                        $('<a/>').attr('href', item.link).append(
                          $('<img/>').css({ 'width' : 140, 'height' : 100 }).attr("src", "http://placehold.it/140x100")
                          )
                        )
                      );
                 } else if ('www.amazon.com' === item.displayLink) {
                    // we don't want amazon results showing up as they
                    // will be duplicates of what Amazon gives us
                    // defList.append(
                    //   $('<li/>').append(
                    //     $('<a/>').text(item.title).attr('href', item.link)
                    //     )
                    //   );
                 } else if ('www.yelp.com' === item.displayLink) {
                    // we don't want yelp results showing up as they
                    // will be duplicates of what Amazon gives us
                    // defList.append(
                    //   $('<li/>').append(
                    //     $('<a/>').text(item.title).attr('href', item.link)
                    //     )
                    //   );
                  } else {
                    rest.push(item);
                  }
                }
              }
              var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');

              rest.forEach(function (item, index, list) {
                content.append(
                  $('<div class="result-item"/>').append(
                    $('<a class="result-title"/>').html(item.htmlTitle).attr('href', item.link),
                    $('<a class="result-url"/>').text(item.formattedUrl),
                    $('<p class="result-snippet"/>').html(item.htmlSnippet)
                    )
                  )
              });

              break;

            case 'amazon.com':
              var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');
              var product = data.result && data.result.length;

              if (product) {
                data.result.every(function (item, index) {
                  if (item.detailpageurl && item.itemattributes) {
                  content.append(
                    $('<div class="result-item"/>').append(
                      $('<a class="result-title"/>').attr('href', item.detailpageurl[0]).text(item.itemattributes[0].title[0]),
                      $('<p class="result-snippet"/>').html((item.itemattributes[0].feature)? item.itemattributes[0].feature[0] : '')
                      )
                    );
                  }
                  if (index > 4) {
                    return false;
                  } else {
                    return true;
                  }
                });
              }
              break;

            case 'yelp.com':
              var businesses = data.result && data.result.businesses;
              var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');

              if (businesses) {
               businesses.every(function (item, index) {
                content.append(
                  $('<div class="result-item cf"/>').append(
                    $('<img class="result-image"/>').attr('src', item.image_url),
                    $('<a class="result-title"/>').attr('href', item.url).text(item.name),
                    $('<p class="result-snippet"/>').text(item.snippet_text)
                    )
                  );
                  if (index > 4) {
                    return false;
                  } else {
                    return true;
                  }
                });
              }
              break;

            case 'en.wikipedia.org':
              var article = data.result;

              if (article) {
                wrapper.find('#definition-text').html(article);
              }
              break;

            default:
              break;
          };
        });

        break;
      }
    }
  });

  // Load initial search template
  nunjucks.render('suggest.html', function (err, res) {
    wrapper.find('#suggestions').html(res);
  });

  wrapper.on('keyup', '#fifi-find', function (ev) {
    ev.preventDefault();

    var value = $(ev.target).val().toString();

    autoset.engineClear();
    wrapper.find('.suggestions').empty();

    if (value.length > 0) {
      lastTerm = value;
      socket.emit('api/find', { term: value, location: geo.getLastLocation() });
    } else {
      wrapper.find('.suggestions').empty();
    }
  });

  wrapper.find('#fifi-find').one('focus', function () {
    wrapper.find('#fifi-find-box')
           .addClass('fifi-find-box-focused')
           .find('#geolocation-box')
           .addClass('geolocation-box-focused');
    geo.startWatchingPosition(wrapper.find('#geolocation-name'));
  });

  function goBack() {
    wrapper.find('#details').hide();
    wrapper.find('#suggestions').show();
    // reset original search terms
    wrapper.find('#fifi-find').val(lastTerm);
    inResults = false;
  }

  wrapper.find('#fifi-find').on('focus', function () {
    if (inResults) {
      goBack();
    }
  });

  // on N+1 runs, if we've already successfully gotten their location
  // lets just go ahead and grab it again.  there's no real API to know
  // that our site has been granted the location permission
  if (geo.haveGeolocationPermission()) {
    geo.startWatchingPosition(wrapper.find('#geolocation-name'));
  }

  wrapper.on('touchstart click', function (ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      case 'concept':
        wrapper.find('#suggestions').hide();
        lastEngine = self.data('engine');
        // save the current terms
        lastTerm = wrapper.find('#fifi-find').val();
        // set suggested terms as current
        wrapper.find('#fifi-find').val(self.data('term'));

        for (var engine in autoset.engines) {
          socket.emit('api/query', {
            term: self.data('term'),
            location: geo.getLastLocation(),
            engineId: engine
          });
        }

        nunjucks.render('details.html', { term: self.data('term') }, function (err, res) {
          inResults = true;
          wrapper.find('#details').html(res).show();
        });
        break;

      case 'back':
        goBack();
        break;

      case 'geolocation':
        if (!geo.isWatchingPosition()) {
          geo.startWatchingPosition(wrapper.find('#geolocation-name'));
        } else {
          geo.stopWatchingPosition();
        }
        break;
    }
  });
});
