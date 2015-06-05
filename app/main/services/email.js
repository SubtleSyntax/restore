'use strict';
angular.module('main')
.factory('Email', function ($log, $q) {

  return {

    isAvailable: function () {
      var q = $q.defer();

      cordova.plugins.email.isAvailable(q.resolve);

      return q.promise;
    },

    open: function (params) {
      // to:          Array, // email addresses for TO field
      // cc:          Array, // email addresses for CC field
      // bcc:         Array, // email addresses for BCC field
      // attachments: Array, // file paths or base64 data streams
      // subject:    String, // subject of the email
      // body:       String, // email body (for HTML, set isHtml to true)
      // isHtml:    Boolean, // indicats if the body is HTML or plain text

      var q = $q.defer();

      cordova.plugins.email.open(params, q.resolve);

      return q.promise;
    }
  };

});
