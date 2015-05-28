'use strict';
angular.module('main')
.controller('Start', function ($location, Data, Config) {
  // bind data from service
  this.someData = 'derp';
  this.ENV = Config.ENV;
  this.BUILD = Config.BUILD;

  console.log('Hello from your Controller: StartCtrl in module main:. This is your controller:', this);



  this.goto = function (path) {
    console.log('[Start] Going to ' + path);
    $location.path(('/' + path).replace(/\/+/g, '/'));
  };

});
