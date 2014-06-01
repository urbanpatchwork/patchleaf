
(function() {

  'use strict';

  var CATEGORIES_URL = '/mocks/categories.json';
  var PROJECTS_URL = '/mocks/projects.geojson';
  var PROJECT_PAGE_URL_TPL = "/project/{id}";

  var CATEGORY_ICONS = {
    1: {icon: 'fa-th', color: 'green'}, //community garden
    3: {icon: 'fa-usd', color: 'blue'}, //market garden
    9: {icon: 'fa-farm', color: 'darkgreen'}, //urban farm
    10: {icon: 'fa-circle-o', color: 'orange'} //resources
  };

  // *********************************************************

  L.Icon.Default.imagePath = "/css/images";

  var map = L.map('map', {
    zoomControl: false
  });

  L.control.zoom({position: 'bottomright'}).addTo(map);

  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/jseppi.id24pohb/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>.' +
      'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>'
  }).addTo(map);


  //variable to hold projects layer
  var projectsLayer = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 30
  });
  projectsLayer.addTo(map);

  // *********************************************************

  var app = angular.module('up', ['ngAnimate']);

  // *********************************************************

  app.factory('ProjectService', function ($http, $q) {
    var service = {};

    var _projectsCache;

    service.fetch = function(options) {
      //options.selectedArea - {point, radius}
      //options.categoryIds - specific category ids to filter
      var deferred = $q.defer();
      
      if (_projectsCache) {
        //TODO: filtering
        deferred.resolve(_projectsCache);
      }
      else {
        $http.get(PROJECTS_URL)
          .success(function (results) {
            //TODO: filter based on categoryIds
            // and selectedArea
            _projectsCache = results;
            deferred.resolve(results);
          });
      }
      return deferred.promise;
    };

    return service;
  });


  // *********************************************************

  app.factory('CategoryService', function ($http, $q) {
    var service = {};

    service.fetch = function() {
      var deferred = $q.defer();
      $http.get(CATEGORIES_URL)
        .success(function (results) {
          deferred.resolve(results);
        });
      return deferred.promise;
    };

    return service;
  });


  // *********************************************************

  var projectPopup = function(props) {
    var html = [];
    html.push("<div class='project-popup'>");
    html.push("<p><small>" + props.Category + "</small></p>");
    html.push("<h4>" + props.Name + "</h4>");
    html.push("<p>" + props.Description + "</p>");
    html.push("<p><a href='#'><i class='fa fa-info-circle'></i> Project Page</a></p>");
    html.push("</div>");

    return html.join('');
  };

  var categoryIcon = function(catId) {
    //get the icon or a default
    var iconDesc = CATEGORY_ICONS[catId] || 
      {icon: 'fa-circle', color: 'green'};

    var icon = L.AwesomeMarkers.icon({
      icon: iconDesc.icon,
      markerColor: iconDesc.color,
      prefix: 'fa'
    });

    return icon;
  };

  var updateProjectFeatures = function(projectGeoJson) {
    projectsLayer.clearLayers();

    _.each(projectGeoJson.features, function (feat) {
      
      var latlng = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
      var marker = L.marker(latlng, {
          icon: categoryIcon(feat.properties.CategoryId)
      });

      marker.bindPopup(projectPopup(feat.properties));
      projectsLayer.addLayer(marker);
    });

      
    map.fitBounds(projectsLayer.getBounds());
  }

  app.controller('MapCtrl', function ($scope, ProjectService, CategoryService) {
    $scope.showCategories = false;
    $scope.selectedArea = null; //ZIPCode or point-radius
    $scope.currentProjects = []; //current project features
    $scope.categories = []; //all valid categories
    $scope.selectedCategories = []; //only selected categories

    map.invalidateSize(false); //must call because of ng-cloak

    //retrieve all the valid categoies
    CategoryService.fetch()
      .then(function (cats) {
        //default to all set to isSelected
        _.each(cats, function (c) { c.isSelected = true; });

        //set $scope.categories to the fetched results
        angular.copy(cats, $scope.categories);
      });


    $scope.toggleListView = function() {
      console.log('toggle list view');
    };

    $scope.toggleCategory = function(cat) {
      cat.isSelected = !cat.isSelected;
    };


    $scope.$watch('categories', function(newvals, oldvals) {
      //skip the first time this watch is triggered
      if (_.isEmpty(newvals) && _.isEmpty(oldvals)) {
        return;
      }

      var selectedCats = _.where($scope.categories, {isSelected: true});
      angular.copy(selectedCats, $scope.selectedCategories);
    }, true);

    $scope.$watch('selectedCategories', function() {
      console.log('TODO: Fetch projects, update currentProjects list');
      console.log('  -- selectedCategories', $scope.selectedCategories);

      ProjectService.fetch()
        .then(updateProjectFeatures);

    }, true);

  });

})();