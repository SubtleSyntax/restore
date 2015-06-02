'use strict';
angular.module('main')
.factory('Signature', function ($log, $q) {

  return {
    getSignature: function (title, htmlPage) {
      title = title || 'Please sign';
      htmlPage = htmlPage || '';

      var Signature = cordova.require('nl.codeyellow.signature.Signature')
        , q = $q.defer();

      Signature.getSignature(q.resolve, q.reject, title, htmlPage);

      return q.promise;
    }
  };

});
