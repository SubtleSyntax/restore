'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  // TODO: load other modules selected during generation
])
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  console.log('Allo! Allo from your module: ' + 'main');

  $urlRouterProvider.otherwise('/start');

  // some basic routing
  $stateProvider
    .state('start', {
      url: '/start',
      templateUrl: 'main/templates/start.html',
      controller: 'StartCtrl as start'
    })
    .state('scan', {
      url: '/scan',
      templateUrl: 'main/templates/scan.html',
      controller: 'ScanCtrl as scan'
    })
    .state('sign', {
      url: '/sign',
      templateUrl: 'main/templates/sign.html',
      controller: 'SignCtrl as sign'
    })
    .state('view', {
      url: '/view',
      templateUrl: 'main/templates/view.html',
      controller: 'ViewCtrl as view'
    })
    ;

}]);
