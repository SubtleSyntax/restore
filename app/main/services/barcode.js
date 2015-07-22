/* global angular, cordova */
'use strict'
angular.module('main')
  .factory('Barcode', function ($log, $q) {
    return {
      scan: function () {
        return $q(function (resolve, reject) {
          cordova.plugins.barcodeScanner.scan(resolve, reject)
        })
      }
    }

  })
