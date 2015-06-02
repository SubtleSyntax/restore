'use strict';
angular.module('main')
.controller('Scan', function ($scope, $location, $log, Data, Config) {
  // bind data from service
  $scope.ENV = Config.ENV;
  $scope.BUILD = Config.BUILD;
  $scope.data = Data;
  $scope.scanError = null;
  $scope.signError = null;

  $log.log('[Start] Init', this);

  // Show switches

  $scope.showScan = function () {
    return Data.currentScan
      && !$scope.scanError;
  };

  $scope.showScanError = function () {
    return !!$scope.scanError;
  };

  $scope.showSignPrompt = function () {
    return Data.currentScan
      && !$scope.scanError
      && !Data.currentSignature
      && !$scope.signError;
  };

  $scope.showSignature = function () {
    return Data.currentSignature
      && !$scope.signError;
  };

  $scope.showSignError = function () {
    return !!$scope.scanError;
  };


  $scope.showSavePrompt = function () {
    return $scope.showScan()
      && $scope.showSignature();
  };

  // Scan and Sign functionality

  $scope.scan = function () {
    return Data.scan()
      .then(function (result) {
        $log.log('[Scan] Scan result', result);
        $scope.scanError = null;
        return result;
      })
      .catch(function (err) {
        $log.error('[Scan] Scan error', err);
        $scope.scanError = err;
      });
  };


  $scope.sign = function () {
    return Data.sign()
      .then(function (result) {
        $log.log('[Scan] Sign result', result);
        $scope.signError = null;
        return result;
      })
      .catch(function (err) {
        $log.error('[Scan] Sign error', err);
        $scope.signError = err && err.message || err;
      });
  };


  $scope.save = function () {
    Data.save()
      .then(function (result) {
        $log.error('[Scan] Saved', result);
      })
      .catch(function (err) {
        $log.error('[Scan] Save error', err);
      });
  };

  // Init
  $scope.scan();


  //Data.getAll().then(function (result) { $scope.records = result; });

});
