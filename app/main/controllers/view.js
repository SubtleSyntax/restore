'use strict';
angular.module('main')
.controller('View', function ($scope, $location, $log, Data, Config) {

  $scope.ENV = Config.ENV;
  $scope.BUILD = Config.BUILD;
  $scope.data = Data;

  $log.log('[View] Init', this);


});
