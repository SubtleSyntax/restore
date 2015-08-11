/* global angular, cordova */
'use strict'
angular.module('main')
  .factory('Email', function ($log, $q) {
    return {
      open: function (params) {
        // to:          Array, // email addresses for TO field
        // cc:          Array, // email addresses for CC field
        // bcc:         Array, // email addresses for BCC field
        // attachments: Array, // file paths or base64 data streams
        // subject:    String, // subject of the email
        // body:       String, // email body (for HTML, set isHtml to true)
        // isHtml:    Boolean, // indicats if the body is HTML or plain text

        console.log(JSON.stringify(params.attachments))

        return $q(function (resolve, reject) {
          cordova.plugins.email.open(params, resolve)
        })
      }
    }
  })
