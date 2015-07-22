/* global angular, cordova */
'use strict'
angular.module('main')
  .factory('Signature', function ($log, $q) {
    return {
      getSignature: function (title, htmlPage) {
        title = title || 'Please sign'
        htmlPage = htmlPage || ''

        var Signature = cordova.require('nl.codeyellow.signature.Signature')

        return $q(function (resolve, reject) {
          Signature.getSignature(resolve, reject, title, 'Done', '', htmlPage)
        })
      }
    }

  })
