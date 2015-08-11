/* global angular */
'use strict'
angular.module('main')
  .controller('View', function ($scope, $location, $log, $ionicModal, Data, Email, Config) {
    $scope.ENV = Config.ENV
    $scope.BUILD = Config.BUILD
    $scope.data = Data

    $scope.showDelete = false
    $scope.showReorder = false
    $scope.listCanSwipe = true

    $scope.signatures = []
    $scope.signaturesLoading = false

    $scope.showEmail = true
    // Email.isAvailable().then(function (available) {
    //   $scope.showEmail = available
    // })

    $log.log('[View] Init', this)

    console.log('[View] Config :: ' + JSON.stringify(Config))
    // console.log(Data.find())

    $scope.toggleDelete = function () {
      $scope.showDelete = !$scope.showDelete
    }

    $scope.delete = function (item) {
      Data.delete(item).then(function () {
        $scope.refresh()
      })
    }

    $scope.refresh = function (filter) {
      $scope.signaturesLoading =
      Data.getAll().then(function (docs) {
        $scope.signatures = docs
        $scope.signaturesLoading = false
      })
    }

    $scope.exportEmail = function () {
      if ($scope.signatures && $scope.signatures.length) {
        var count = 1
        var html = $scope.signatures.map(function (sig) {
          return '<div>' +
            '<div>Contact ' + count++ + '</div>' +
            '<div>' +
              sig._display.map(function (item) {
                return '<b>' + item.label + '</b>: ' + item.value + '<br>'
              }).join(' ') +
              '<b>Signed</b>: ' + (sig.signature ? 'yes' : 'no') +
            '</div>' +
          '</div>'
        }).join('<hr>')

        Data.exportAll().then(function (files) {
          Email.open({
            subject: 'Signature Export from Re:Store App',
            body: html,
            isHtml: true,
            attachments: files.map(function (file) { return 'file://' + file })
          })
        })
      }
    }

    // Modal

    $ionicModal.fromTemplateUrl('detail-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal
    })

    $scope.openModal = function (detail) {
      if (detail) {
        console.log(Object.keys(detail))

        $scope.modal.scope.detail = detail
        $scope.modal.show()
      }
    }

    $scope.closeModal = function () {
      $scope.modal.hide()
      $scope.modal.scope.detail = null
    }

    $scope.$on('$destroy', function () {
      $scope.modal.remove()
      $scope.modal.scope.detail = null
    })

    // Init

    $scope.refresh()
  })
