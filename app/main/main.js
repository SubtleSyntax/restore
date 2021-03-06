/* global angular */
'use strict'
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'pouchdb'
])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/start')

    // some basic routing
    $stateProvider
      .state('start', {
        url: '/start',
        templateUrl: 'main/templates/start.html',
        controller: 'Start as start'
      })
      .state('scan', {
        url: '/scan',
        templateUrl: 'main/templates/scan.html',
        controller: 'Scan as scan'
      })
      .state('sign', {
        url: '/sign',
        templateUrl: 'main/templates/sign.html',
        controller: 'Sign as sign'
      })
      .state('view', {
        url: '/view',
        templateUrl: 'main/templates/view.html',
        controller: 'View as view'
      })
  })
