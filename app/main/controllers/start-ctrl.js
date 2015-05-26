'use strict';
angular.module('main')
.controller('StartCtrl', ['$location', 'Start', 'Config', function ($location, Start, Config) {
  // bind data from service
  this.someData = Start.someData;
  this.ENV = Config.ENV;
  this.BUILD = Config.BUILD;

  console.log('Hello from your Controller: StartCtrl in module main:. This is your controller:', this);
  // TODO: do your controller thing

  this.gotoScan = function () {
    console.log('[Start] Going to Scan');
    $location.path('/scan');
  };

}]);
