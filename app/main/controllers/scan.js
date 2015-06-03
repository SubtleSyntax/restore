'use strict';
angular.module('main')
.controller('Scan', function ($scope, $window, $location, $log, Data, Config) {
  // bind data from service
  $scope.ENV = Config.ENV;
  $scope.BUILD = Config.BUILD;
  $scope.data = Data;
  $scope.scanData = null;
  $scope.signData = null;
  $scope.scanError = null;
  $scope.signError = null;

  $log.log('[Scan] Init', this);

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
    return !!$scope.signError;
  };


  $scope.showSavePrompt = function () {
    return Data.isValid();
  };

  // Scan and Sign functionality

  $scope.scan = function () {
    Data.reset();

    return Data.scan()
      .then(function (result) {
        $log.log('[Scan] Scan result: ' + JSON.stringify(result));

        $scope.scanError = null;
        $scope.scanData = [];

        Object.keys(result).forEach(function (k) {
          var label = k.replace(/_/g, ' ');

          if (result.hasOwnProperty(k) && !/^(vCard|version)$/i.test(k)) {

            if (angular.isArray(result[k])) {
              $scope.scanData.push({ label: label, value: result[k].join(', ') });

            } else if (angular.isObject(result[k])) {
              $scope.scanData.push({
                label: label,
                value: Object.keys(result[k]).map(function (i) {
                  return i.replace(/_/g, ' ') + ': ' + result[k][i];
                }).join(', ')
              });

            } else {
              $scope.scanData.push({ label: label, value: result[k] });
            }
          }
        });

        return result;
      })
      .catch(function (err) {
        $log.error('[Scan] Scan error: ' + JSON.stringify(err && err.message || err));
        $scope.scanError = err;
      });
  };


  $scope.sign = function () {
    return Data.sign()
      .then(function (result) {
        $log.log('[Scan] Sign result: ' + JSON.stringify(result));
        $scope.signError = null;
        return result;
      })
      .catch(function (err) {
        $log.error('[Scan] Sign error: ' + JSON.stringify(err && err.message || err));

        if (err.message === 'Cancelled by user') {
          $scope.signError = null;
          return;
        }

        $scope.signError = err && err.message || err;
      });
  };


  $scope.save = function () {
    Data.save()
      .then(function (result) {
        $log.log('[Scan] Saved: ' + JSON.stringify(result));
        Data.reset();
        // todo: success message
        $location.path('/start');
      })
      .catch(function (err) {
        $log.error('[Scan] Save error: ' + JSON.stringify(err && err.message || err));
      });
  };

  // Init
  $scope.scan();


  //Data.getAll().then(function (result) { $scope.records = result; });

});
