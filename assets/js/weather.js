(function () {
  var widget = document.querySelector('.weather-widget');
  if (!widget) return;

  var lat = widget.getAttribute('data-lat');
  var lng = widget.getAttribute('data-lng');
  if (!lat || !lng) { widget.hidden = true; return; }

  var forecastPageUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lng;

  // Small hand-drawn line icons (stroke, currentColor) in the same idiom as the hero's contour
  // SVG, so the widget doesn't pull in an external icon font just to show sun/cloud/rain/etc.
  var ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 14.6A8.4 8.4 0 1 1 9.4 3.8a7 7 0 0 0 10.8 10.8z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 18a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 17.8 11H18a3 3 0 0 1 0 6H7.2z"/></svg>',
    sunCloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="7.5" r="2.6"/><path d="M8 2.7v1.6M3.7 7.5h1.6M4.9 4.2l1.1 1.1M11.1 4.2l-1.1 1.1"/><path d="M9 19a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 19.6 12H19.8a3 3 0 0 1 0 6H9z"/></svg>',
    moonCloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10.4 4.4a4 4 0 0 0 3.9 5.9 3.3 3.3 0 0 1-3.2 2.5"/><path d="M9 19a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 19.6 12H19.8a3 3 0 0 1 0 6H9z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 15a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 17.8 8H18a3 3 0 0 1 0 6H7.2z"/><path d="M8.5 19.2l-1 2M12.5 19.2l-1 2M16.5 19.2l-1 2"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 15a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 17.8 8H18a3 3 0 0 1 0 6H7.2z"/><path d="M8.5 18.5v3M7 19.6l3-1.1M7 20.7l3-1.1M15.5 18.5v3M14 19.6l3-1.1M14 20.7l3-1.1"/></svg>',
    storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 14a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 17.8 7H18a3 3 0 0 1 0 6H7.2z"/><path d="M12.6 14.5l-2.6 4.3h2.3l-1.6 3.7 4-4.7h-2.3l1.6-3.3z" fill="currentColor" stroke="none"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 13.5a4.1 4.1 0 1 1 .6-8.16A5.2 5.2 0 0 1 17.8 6.5H18a3 3 0 0 1 0 6H7.2z"/><path d="M5 17.5h14M6.5 20h11"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11a2.5 2.5 0 1 0-2.2-3.7M3 12.5h14.5a2.5 2.5 0 1 1-2.2 3.7M3 17h9"/></svg>'
  };

  function pickIcon(shortForecast, isDaytime) {
    var s = (shortForecast || '').toLowerCase();
    if (s.indexOf('thunder') > -1 || s.indexOf('storm') > -1) return ICONS.storm;
    if (s.indexOf('snow') > -1 || s.indexOf('sleet') > -1 || s.indexOf('ice') > -1) return ICONS.snow;
    if (s.indexOf('rain') > -1 || s.indexOf('shower') > -1 || s.indexOf('drizzle') > -1) return ICONS.rain;
    if (s.indexOf('fog') > -1 || s.indexOf('haze') > -1 || s.indexOf('mist') > -1) return ICONS.fog;
    if (s.indexOf('wind') > -1) return ICONS.wind;
    if (s.indexOf('cloudy') > -1 || s.indexOf('overcast') > -1) return ICONS.cloud;
    if (s.indexOf('partly') > -1 || s.indexOf('mostly sunny') > -1 || s.indexOf('mostly clear') > -1) {
      return isDaytime ? ICONS.sunCloud : ICONS.moonCloud;
    }
    return isDaytime ? ICONS.sun : ICONS.moon;
  }

  function showFallback() {
    widget.innerHTML =
      '<div class="weather-current weather-current-fallback">' +
        '<span class="weather-icon">' + ICONS.cloud + '</span>' +
        '<p class="weather-status mono">Current conditions unavailable right now. ' +
        '<a href="' + forecastPageUrl + '" target="_blank" rel="noopener">Check the National Weather Service</a>.</p>' +
      '</div>';
  }

  // NWS's API is free, keyless, and US-only, which fits this site (all destinations are in California).
  // Two hops are required: /points looks up the forecast zone for the coordinates, which then
  // points at the actual forecast feed.
  fetch('https://api.weather.gov/points/' + lat + ',' + lng, { headers: { Accept: 'application/geo+json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('points lookup failed');
      return res.json();
    })
    .then(function (points) {
      var props = points.properties || {};
      var forecastUrl = props.forecast;
      if (!forecastUrl) throw new Error('no forecast url for these coordinates');

      var place = props.relativeLocation && props.relativeLocation.properties;
      var placeName = place ? (place.city + ', ' + place.state) : 'this area';

      return fetch(forecastUrl).then(function (res) {
        if (!res.ok) throw new Error('forecast fetch failed');
        return res.json();
      }).then(function (forecast) {
        var period = forecast.properties && forecast.properties.periods && forecast.properties.periods[0];
        if (!period) throw new Error('no forecast period returned');

        widget.innerHTML =
          '<div class="weather-current">' +
            '<span class="weather-icon">' + pickIcon(period.shortForecast, period.isDaytime) + '</span>' +
            '<span class="weather-main">' +
              '<span class="weather-temp">' + period.temperature + '°' + period.temperatureUnit + '</span>' +
              '<span class="weather-desc">' + period.shortForecast + '</span>' +
            '</span>' +
            '<a class="weather-link" href="' + forecastPageUrl + '" target="_blank" rel="noopener">Full forecast →</a>' +
          '</div>' +
          '<p class="weather-meta">' +
            '<span>' + period.name + ' &middot; near ' + placeName + '</span>' +
            '<span>Wind ' + period.windSpeed + ' ' + period.windDirection + '</span>' +
          '</p>';
      });
    })
    .catch(showFallback);
})();
