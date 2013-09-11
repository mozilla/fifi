define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils',
  'base/geo', 'settings', 'nunjucks', 'templates'],
  function ($, io, find, Autoset, utils, geo, settings, nunjucks, templates) {
  'use strict';

  var wrapper = $('#wrapper');
  var find = $('#fifi-find');

  var inResults = false;
  var socketUrl = settings.SOCKET_URL;
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
    var value = find.val().toString();

    if (results === 'undefined') {
      /*
      nunjucks.render('results.html', {
        engineSet: {},
        found: 0
      }, function (err, res) {
        wrapper.find('.suggestions').append(res);
      });
*/
    } else {
      /*
      for (var i in autoset.results) {
        socket.emit('api/suggestImage', {
          location: geo.getLastLocation(),
          engineId: 'google.com',
          term: i
        });
      }
      */
      if (data.secondary) {
        if (value === data.originalTerm) {
          autoset.generateSecondary(value, results, data.engineId, function () {
            nunjucks.render('results_secondary.html', {
              engineSet: autoset.engines,
              found: utils.keySize(autoset.engines),
              term: data.term
            }, function (err, res) {
              if (err) console.error(err);
              else wrapper.find('.suggestions-secondary').html(res);
            });
          });
        }
      } else {
        if (value === data.term) {
          autoset.generate(value, results, data.engineId, function () {
            nunjucks.render('results.html', {
              engineSet: autoset.engines,
              found: utils.keySize(autoset.engines)
            }, function (err, res) {
              if (err) console.error(err);
              else wrapper.find('.suggestions').html(res);
            });
          });
        }
      }
    }
  });

  socket.on('api/suggestImageDone', function (data) {
    console.log('GOT api/suggestImageDone: ', data.term);

    if (data.result.items && data.result.items[0].pagemap.cse_image) {
      wrapper.find('.suggestions li[data-term="' + data.term + '"]')
             .css('background-image',
                  'url(' + data.result.items[0].pagemap.cse_image[0].src + ')');
    }
  });

  socket.on('api/queryDone', function (data) {
    console.log('GOT api/queryDone: ', data);

    var engine = autoset.engines[lastEngine];

    nunjucks.render('result.html', {
      engineId: data.engineId
    }, function (err, res) {
      // ignore the wikipedia entry for now
      if (data.engineId !== 'en.wikipedia.org') {
        wrapper.find('#details-list').append(res);
      }

      var defList = wrapper.find('#definition-links');
      var defVideos = wrapper.find('#definition-videos');

      switch (data.engineId) {
        case 'google.com':
          var link = data.result && data.result.items;
          var rest = [];

          if (link) {
            var list = data.result.items;

            for (var index = 0, item; item = list[index]; index += 1) {
              if ('en.wikipedia.org' === item.displayLink) {
                defList.append(
                  $('<li class="wikipedia icon"/>').append(
                    $('<a/>').text(item.title.replace(' - Wikipedia, the free encyclopedia', '')).attr('href', item.link)
                    )
                  );
              } else if ('twitter.com' === item.displayLink) {
                defList.append(
                  $('<li class="twitter icon"/>').append(
                    $('<a/>').text(item.link.replace(/http(s)?:\/\/twitter\.com\//,'')).attr('href', item.link)
                    )
                  );
              // locate a vimeo user account
              } else if ('vimeo.com' === item.displayLink) {
                defList.append(
                  $('<li class="vimeo icon"/>').append(
                    $('<a/>').text(item.title.replace('on Vimeo', '')).attr('href', item.link)
                    )
                  );
              // Locate a facebook page for result
              } else if ('www.facebook.com' === item.displayLink) {
                defList.append(
                  $('<li class="facebook icon"/>').append(
                    $('<a/>').text(item.title.replace('| Facebook', '')).attr('href', item.link)
                    )
                  );
              // find a YouTube user account
              } else if (item.formattedUrl.indexOf('www.youtube.com/user/') === 0) {
                defList.append(
                  $('<li class="youtube icon"/>').append(
                    $('<a/>').text(item.title.replace('- YouTube', '')).attr('href', item.link)
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

        case 'twitter.com':
          var tweet = data.result;

          if (tweet) {
            console.log('got tweet ', tweet);
          }
          break;

        default:
          break;
      };
    });
  });

  // Load initial search template
  nunjucks.render('suggest.html', function (err, res) {
    wrapper.find('#suggestions').html(res);
  });

  find.get(0).addEventListener('input', function (ev) {
    var value = find.val().toString();

    // if this is a change in terms or empty string
    if (lastTerm !== value || value.length < 1) {
      autoset.engineClear();
      wrapper.find('.suggestions, .suggestions-secondary').empty();
    }

    lastTerm = value;

    if (value.length >= 1) {
      socket.emit('api/find', {
        term: value,
        location: geo.getLastLocation(),
        geolocation: geo.getLastPosition().coords.latitude + ',' + geo.getLastPosition().coords.longitude
      });
    }
  });

  wrapper.find('#fifi-find').one('focus', function () {
    wrapper.find('#fifi-find-box')
           .addClass('fifi-find-box-focused')
           .find('#geolocation-box')
           .addClass('geolocation-box-focused');
    wrapper.addClass('fifi-find-box-focused');
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

  geo.on('geolocation', function geoImg() {
    // only call this function once
    geo.off('geolocation', geoImg);

    var API_KEY = "bcef359dcec703ca6580b92c5682f9f9";
    // popular tags via http://www.flickr.com/photos/tags/
    var url = encodeURI("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+ API_KEY + "&tags=architecture,sky,nature,travel&safe_search=1&per_page=40");
    var position = geo.getLastPosition();
    var lat = parseFloat(position.coords.latitude, 10);
    var lng = parseFloat(position.coords.longitude, 10);
    url += "&lat="+lat + "&lon=" + lng;
    var src;
    $.getJSON(url + "&format=json&jsoncallback=?", function(data){
      var count = data.photos.photo.length;
      var randomIndex = Math.floor(Math.random()*count);
      var item = data.photos.photo[randomIndex];
      var src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_b.jpg";
      // it's the only way to :before CSS to the page :(
      $("body").append(
        $("<style/>").text(
          "#wrapper:before { background-image:" + 'url(' + src + ');'  + " } "
          )
        );
    });
  });

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
            geolocation: geo.getLastPosition().coords.latitude + ',' + geo.getLastPosition().coords.longitude,
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
