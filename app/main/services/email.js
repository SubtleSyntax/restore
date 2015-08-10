/* global angular */
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

        return $q(function (resolve, reject) {
          // cordova.plugins.email.open(params, resolve)
          window.plugins.emailComposer.showEmailComposerWithCallback(
            resolve,
            params.subject,
            params.body,
            params.to,
            params.cc,
            params.bcc,
            params.isHtml || false,
            params.attachments || null,
            params.attachmentsData || null
          )
        })
      }
    }
  })
