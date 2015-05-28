'use strict';
angular.module('main')
.factory('Data', function ($log) {

  var Data = function (params) {
    this.debug = function () {};
    this.set(params);
  };

  Data.prototype.set = function (params) {
    params = params || {};

    if (params.debug) {
      this.debug = $log.info;
    }
  };

  // Singleton Instance
  return new Data();
});
