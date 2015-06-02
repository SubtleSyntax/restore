'use strict';
angular.module('main')
.controller('Start', function ($scope, $location, $log, Data, Config) {
  // bind data from service
  $scope.ENV = Config.ENV;
  $scope.BUILD = Config.BUILD;

  $log.log('[Start] Init', this);

  // Data.getAll().then(function (result) {
  //   $log.info('[Start] Current signature records', result);
  // });

  $scope.goto = function (path) {
    console.log('[Start] Going to ' + path);
    $location.path(('/' + path).replace(/\/+/g, '/'));
  };

});
