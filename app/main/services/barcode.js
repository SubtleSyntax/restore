'use strict';
angular.module('main')
.factory('Barcode', function ($log, $q) {

  return {
    scan: function () {
      var q = $q.defer();

      cordova.plugins.barcodeScanner.scan(q.resolve, q.reject);

      return q.promise;
    }
  };

});
