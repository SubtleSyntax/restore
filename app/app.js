/* global angular */
'use strict'

// window.plugins.orientationLock.lock('landscape')
angular.module('Re:Store', [
  // your modules
  'main'
])

window.ionic.Platform.ready(function () {
  angular.bootstrap(document.querySelector('body'), ['Re:Store'])
})
