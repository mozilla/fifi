define(['jquery', 'socket.io', 'base/find', 'base/autoset', 'base/utils',
  'base/geo', 'settings', 'nunjucks', 'templates', 'moment'],
  function ($, io, find, Autoset, utils, geo, settings, nunjucks, templates, moment) {
  'use strict';

  var wrapper = $('#wrapper');
  var find = $('#fifi-find');

  var inResults = false;
  var socketUrl = settings.SOCKET_URL;
  var socket = io.connect(socketUrl);
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

    nunjucks.render('result.html', {
      engineId: data.engineId
    }, function (err, res) {
      if (err) {
        console.error(err);
        return;
      }

      // ignore the wikipedia entry for now
      if (data.engineId !== 'en.wikipedia.org') {
        wrapper.find('#details-list').append(res);
      }

      var defList = wrapper.find('#definition-links');
      var defVideos = wrapper.find('#definition-videos');

      switch (data.engineId) {
        case 'google.com':
          var link = data.result && data.result.items;
          var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');
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

            rest.forEach(function (item, index, list) {
              content.append(
                $('<div class="result-item result-item-fixed-height"/>').append(
                  $('<a class="result-title"/>').html(item.htmlTitle).attr('href', item.link),
                  $('<a class="result-url"/>').text(item.formattedUrl),
                  $('<p class="result-snippet"/>').html(item.htmlSnippet)
                  )
                )
            });
          } else {
            content.parent().remove();
          }

          break;

        case 'amazon.com':
          var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');
          var product = data.result && data.result.length;
          var first, $first;

          if (product) {
            first = data.result.shift();
            $first = $('<div class="result-header cf"/>').css({ 'background-image' : 'url(' + ((first.mediumimage) ? first.mediumimage[0].url[0] : '') + ')' }).appendTo(content);
            $first.append(
              $('<div class="result-header-info"/>').append(
                $('<p class="result-title"/>').text(first.itemattributes[0].title[0]),
                $('<p class="result-price"/>').text((first.itemattributes[0].listprice && first.itemattributes[0].listprice[0].formattedprice) ? first.itemattributes[0].listprice[0].formattedprice[0] : ''),
                $('<p class="result-snippet"/>').html((first.itemattributes[0].feature) ? first.itemattributes[0].feature[0] : '')
              )
            );
            data.result.slice(0, Math.min(3, data.result.length)).forEach(function (item) {
              var attrs = item.itemattributes[0];
              if (item.detailpageurl && attrs) {
                content.append(
                  $('<div class="result-item result-item-fixed-height"/>').data({ url : item.detailpageurl[0] }).append(
                    $('<div class="result-image-wrapper"/>').append(
                      $('<img class="result-image"/>').attr('src', ((item.mediumimage) ? item.mediumimage[0].url[0] : ''))
                    ),
                    $('<div class="result-info"/>').append(
                      $('<p class="result-title"/>').text(attrs.title[0]),
                      $('<p class="result-price"/>').text((attrs.listprice && attrs.listprice[0].formattedprice) ? attrs.listprice[0].formattedprice[0] : '')
                    )
                  )
                );
              }
            });
          } else {
            content.parent().remove();
          }
          break;

        case 'yelp.com':
          var businesses = data.result && data.result.businesses;
          var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');
          var first, $first, $reviews;

          if (businesses) {
            first = businesses.shift();
            $first = $('<div class="result-header cf"/>').css({ 'background-image' : 'url(' + (first.image_url || '').replace(/ms.jpg$/, "l.jpg") + ')' }).appendTo(content);
            $reviews = $('<div class="result-header-reviews"/>');
            for (var i = 0; i < 5; i += 1) {
              if (i < Math.floor(first.rating)) {
                $reviews.append($('<i class="icon-star"></i>'));
              } else if (i < first.rating) {
                $reviews.append(
                  $('<div class="icon-star-half-colored"/>').append(
                    $('<i class="icon-star-half"></i>'),
                    $('<i class="icon-star-half-empty"></i>')
                  )
                );
              } else {
                $reviews.append($('<i class="icon-star-empty"></i>'));
              }
            }
            // need a bit of space between stars and # of reviews
            $reviews.append(" ");
            $first.append(
              $('<div class="result-header-info"/>').append(
                $('<p class="result-title"/>').text(first.name),
                $('<p class="result-header-address"/>').text(first.location.address.shift()),
                $('<a class="result-header-phone"/>').attr({ 'href' : 'tel:' + first.phone }).text(first.display_phone),
                $reviews.append($('<span/>').text(first.review_count + " reviews"))
              )
            );
           businesses.slice(0, Math.min(3, businesses.length)).forEach(function (item) {
            var $reviews = $('<div class="result-reviews"/>');
            for (var i = 0; i < 5; i += 1) {
              if (i < Math.floor(item.rating)) {
                $reviews.append($('<i class="icon-star"></i>'));
              } else if (i < first.rating) {
                $reviews.append(
                  $('<div class="icon-star-half-colored"/>').append(
                    $('<i class="icon-star-half"></i>'),
                    $('<i class="icon-star-half-empty"></i>')
                  )
                );
              } else {
                $reviews.append($('<i class="icon-star-empty"></i>'));
              }
            }
            content.append(
              $('<div class="result-item result-item-fixed-height cf"/>').append(
                $('<div class="result-image-wrapper"/>').append(
                  $('<img class="result-image"/>').attr('src', (item.image_url || ''))
                ),
                $('<div class="result-info"/>').append(
                  $('<p class="result-title"/>').text(item.name),
                  $reviews,
                  $('<span class="result-reviews"/>').text(item.review_count + " reviews")
                )
              )
            );
            });
          } else {
            content.parent().remove();
          }
          break;

        case 'foursquare.com':
          var groups = data.result && data.result.groups;
          var businesses;
          if (groups) {
            groups.every(function (group) {
              if (group.name === "recommended") {
                businesses = group.items;
                return false;
              }
              return true;
            });
          }
          var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');
          var first, $first, $reviews;

          if (businesses) {
            first = businesses.shift();
            $first = $('<div class="result-header cf"/>').css({ 'background-image' : 'url(' + (first.venue.photos.groups[0].items[0].prefix + "320x320" + first.venue.photos.groups[0].items[0].suffix || '') + ')' }).appendTo(content);
            $reviews = $('<div class="result-header-reviews"/>');
            var rating = first.venue.rating / 2;
            for (var i = 0; i < 5; i += 1) {
              if (i < Math.floor(rating)) {
                $reviews.append($('<i class="icon-star"></i>'));
              } else if (i < rating) {
                $reviews.append(
                  $('<div class="icon-star-half-colored"/>').append(
                    $('<i class="icon-star-half"></i>'),
                    $('<i class="icon-star-half-empty"></i>')
                  )
                );
              } else {
                $reviews.append($('<i class="icon-star-empty"></i>'));
              }
            }
            // need a bit of space between stars and # of reviews
            $reviews.append(" ");
            $first.append(
              $('<div class="result-header-info"/>').append(
                $('<p class="result-title"/>').text(first.venue.name),
                $('<p class="result-header-address"/>').text(first.venue.location.address),
                $('<a class="result-header-phone"/>').attr({ 'href' : 'tel:' + first.venue.contact.phone }).text(first.venue.contact.formattedPhone),
                $reviews.append($('<span/>').text(first.venue.likes.count + " likes")),
                $('<i class="icon-foursquare"></i>')
              )
            );
           businesses.slice(0, Math.min(3, businesses.length)).forEach(function (item) {
            var $reviews = $('<div class="result-reviews"/>');
            var rating = item.venue.rating / 2;
            var src = '';
            if (item.venue.photos && item.venue.photos.groups[0] && item.venue.photos.groups[0].items[0]) {
              src = (item.venue.photos.groups[0].items[0].prefix + "100x100" + item.venue.photos.groups[0].items[0].suffix);
            }
            for (var i = 0; i < 5; i += 1) {
              if (i < Math.floor(rating)) {
                $reviews.append($('<i class="icon-star"></i>'));
              } else if (i < rating) {
                $reviews.append(
                  $('<div class="icon-star-half-colored"/>').append(
                    $('<i class="icon-star-half"></i>'),
                    $('<i class="icon-star-half-empty"></i>')
                  )
                );
              } else {
                $reviews.append($('<i class="icon-star-empty"></i>'));
              }
            }
            content.append(
              $('<div class="result-item result-item-fixed-height cf"/>').append(
                $('<div class="result-image-wrapper"/>').append(
                  $('<img class="result-image"/>').attr('src', src)
                ),
                $('<div class="result-info"/>').append(
                  $('<p class="result-title"/>').text(item.venue.name),
                  $reviews,
                  $('<span class="result-reviews"/>').text(item.venue.likes.count + " likes")
                )
              )
            );
            });
          } else {
            content.parent().remove();
          }
          break;

        case 'en.wikipedia.org':
          var article = data.result;

          if (article) {
            wrapper.find('#definition-text').html(article);
          }
          break;

        case 'twitter.com':
          var tweets = data.result;
          var content = wrapper.find('#details-list li[data-engine="' + data.engineId + '"] .content');

          if (tweets) {
            // https://twitter.com/logo#twitter-content
            tweets.statuses.slice(0, Math.min(3, tweets.statuses.length)).forEach(function (item) {
              content.append(
                $('<div class="result-item cf"/>').append(
                  $('<div class="result-tweet"/>').append(
                    $('<div class="result-tweet-user-info"/>').append(
                      $('<span class="result-tweet-user-name"/>').text(item.user.name + " "),
                      $('<span class="result-tweet-user-screen-name"/>').text(item.user.screen_name)
                    ),
                    $('<p class="result-tweet-text"/>').html(item.text),
                    $('<div class="result-tweet-meta"/>').append(
                      $('<p class="result-tweet-time-ago"/>').text(moment(item.created_at).fromNow()),
                      $('<i class="icon-twitter"></i>')
                    )
                  )
                )
              );
            });
          } else {
            content.parent().remove();
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

  find.on('keydown', function (ev) {
    if (ev.which === 13) {
      goSearch(find.val().toString());
    }
  });

  wrapper.find('#fifi-find').one('focus', function () {
    wrapper.addClass('fifi-find-box-focused')
           .find('#fifi-find-box')
           .addClass('fifi-find-box-focused');
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

    var position = geo.getLastPosition();
    var lat = parseFloat(position.coords.latitude, 10);
    var lng = parseFloat(position.coords.longitude, 10);

    var API_KEY = "bcef359dcec703ca6580b92c5682f9f9";
    // http://www.flickr.com/services/api/flickr.photos.search.html
    var options = [ 'method=flickr.photos.search',
                    'api_key=' + API_KEY,
                    'per_page=20',
                    // accuracy of location 6 = Region
                    'accuracy=6',
                    // popular tags via http://www.flickr.com/photos/tags/
                    'tags=architecture,sky,nature,travel',
                    // 1 = photos only, no screenshots etc
                    'content_type=1',
                    // 1 = safe
                    'safe_search=1',
                    // latt / long
                    'lat=' + lat,
                    'lon=' + lng,
                    'format=json',
                    'jsoncallback=?'
                  ].join('&');

    var url = encodeURI("http://api.flickr.com/services/rest/?" + options);
    $.getJSON(url, function(data){
      var src;
      var item = data.photos.photo[Math.floor(Math.random() * data.photos.photo.length)];
      if (item) {
        src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_z.jpg";
        // it's the only way to :before CSS to the page :(
        $("body").append(
          $("<style/>").text(
            "#wrapper:before { background-image:" + 'url(' + src + ');'  + " } "
          )
        );
      }
    });
  });

  function goSearch(term) {
    wrapper.find('#suggestions').hide();
    // save the current terms
    lastTerm = wrapper.find('#fifi-find').val();
    // set suggested terms as current
    wrapper.find('#fifi-find').val(term);

    for (var engine in autoset.engines) {
      socket.emit('api/query', {
        'term': term,
        location: geo.getLastLocation(),
        geolocation: geo.getLastPosition().coords.latitude + ',' + geo.getLastPosition().coords.longitude,
        engineId: engine
      });
    }

    nunjucks.render('details.html', { 'term': term }, function (err, res) {
      inResults = true;
      wrapper.find('#details').html(res).show();
    });
  }

  wrapper.on('touchstart click', function (ev) {
    var self = $(ev.target);

    switch (self.data('action')) {
      case 'concept':
        goSearch(self.data('term'))
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
