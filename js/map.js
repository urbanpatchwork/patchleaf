'use strict';

$(document).ready(function() {
    var map = L.map('map').setView([30.292501817758687, -97.74330139160156], 12);
    var baseLayer = L.tileLayer(
      'https://a.tiles.mapbox.com/v3/jseppi.id24pohb/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>.' +
          'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>'
    }).addTo(map);
});
