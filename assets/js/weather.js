(function () {
  var widget = document.querySelector('.weather-widget');
  if (!widget) return;

  var lat = widget.getAttribute('data-lat');
  var lng = widget.getAttribute('data-lng');
  if (!lat || !lng) { widget.hidden = true; return; }

  var forecastPageUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lng;

  function showFallback() {
    widget.innerHTML =
      '<p class="weather-status mono">Current conditions unavailable right now. ' +
      '<a href="' + forecastPageUrl + '" target="_blank" rel="noopener">Check the National Weather Service</a>.</p>';
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
            '<span class="weather-temp">' + period.temperature + '°' + period.temperatureUnit + '</span>' +
            '<span class="weather-desc">' + period.shortForecast + '</span>' +
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
