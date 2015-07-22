/* global angular */
'use strict'
angular.module('main')
  .controller('Scan', function ($scope, $window, $location, $log, Data, Config) {
    $log.log('[Scan] Init', this)

    $scope.ENV = Config.ENV
    $scope.BUILD = Config.BUILD
    $scope.data = Data
    $scope.scanData = null
    $scope.signData = null
    $scope.scanError = null
    $scope.signError = null

    $scope.scanning = false
    $scope.signing = false
    $scope.saving = false
    $scope.saved = false
    $scope.saveError = null

    // UI state switches

    $scope.isActive = function () {
      return $scope.scanning ||
        $scope.signing ||
        $scope.saving
    }

    $scope.showScan = function () {
      return ($scope.scanData || $scope.scanning) && !$scope.scanError
    }

    $scope.showScanError = function () {
      return !!$scope.scanError
    }

    $scope.showSignPrompt = function () {
      return !$scope.isActive() &&
        $scope.scanData &&
        !$scope.scanError &&
        !$scope.signData &&
        !$scope.signError
    }

    $scope.showSignature = function () {
      return ($scope.signData || $scope.signing) && !$scope.signError
    }

    $scope.showSignError = function () {
      return !!$scope.signError
    }

    $scope.showSavePrompt = function () {
      return !$scope.isActive() &&
        !$scope.saved &&
        Data.isValid()
    }

    $scope.showSaveSuccess = function () {
      return $scope.saved
    }

    // Scan and Sign functionality
    $scope.reset = function () {
      Data.reset()

      $scope.scanData = null
      $scope.signData = null
      $scope.scanError = null
      $scope.signError = null

      $scope.scanning = false
      $scope.signing = false
      $scope.saved = false
      $scope.saveError = null
    }

    $scope.scan = function () {
      $scope.reset()
      $scope.scanning = true

      return Data.scan()
        .then(function (result) {
          $log.log('[Scan] Scan result: ' + JSON.stringify(result))

          $scope.scanning = false
          $scope.scanData = []

          // Prettify the data for showing
          Object.keys(result).forEach(function (k) {
            var label = k.replace(/_/g, ' ')

            if (result.hasOwnProperty(k) && !/^(vCard|version)$/i.test(k)) {
              if (angular.isArray(result[k])) {
                $scope.scanData.push({ label: label, value: result[k].join(', ') })

              } else if (angular.isObject(result[k])) {
                $scope.scanData.push({
                  label: label,
                  value: Object.keys(result[k]).map(function (i) {
                    return i.replace(/_/g, ' ') + ': ' + result[k][i]
                  }).join(', ')
                })

              } else {
                $scope.scanData.push({ label: label, value: result[k] })
              }
            }
          })

        })
        .catch(function (err) {
          $log.error('[Scan] Scan error: ' + JSON.stringify(err && err.message || err))

          $scope.scanning = false

          if (err.message === 'Cancelled by user') {
            $location.path('/start')
            return
          }

          $scope.scanError = err && err.message || err
        })
    }

    $scope.sign = function () {
      $scope.signing = true
      $scope.signData = null
      $scope.signError = null

      return Data.sign()
        .then(function (result) {
          $log.log('[Scan] Sign result: ' + JSON.stringify(result))

          $scope.signing = false
          $scope.signData = result
        })
        .catch(function (err) {
          $log.error('[Scan] Sign error: ' + JSON.stringify(err && err.message || err))

          $scope.signing = false

          if (err.message === 'Cancelled by user') {
            // Do nothing, they should be able to sign again.
            return
          }

          $scope.signError = err && err.message || err
        })
    }

    $scope.save = function () {
      $scope.saving = true
      $scope.saveError = null

      Data.save()
        .then(function (result) {
          $log.log('[Scan] Saved: ' + JSON.stringify(result))

          $scope.saving = false
          $scope.saved = true
        })
        .catch(function (err) {
          $log.error('[Scan] Save error: ' + JSON.stringify(err && err.message || err))

          $scope.saving = false
          $scope.saveError = err && err.message || err
        })
    }

    // Init
    $scope.scan()
  })
