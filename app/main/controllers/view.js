'use strict';
angular.module('main')
.controller('View', function ($location, Data, Config) {
  // bind data from service
  this.someData = 'derp';
  this.ENV = Config.ENV;
  this.BUILD = Config.BUILD;

  console.log('Hello from your Controller: StartCtrl in module main:. This is your controller:', this);
  // TODO: do your controller thing

  this.goto = function (path) {
    console.log('[View] Going to ' + path);
    $location.path(('/' + path).replace(/\/+/g, '/'));
  };

});
