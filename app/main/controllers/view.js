/* global angular, moment */
'use strict'
angular.module('main')
  .controller('View', function ($scope, $location, $log, $ionicModal, Data, Config) {
    $scope.ENV = Config.ENV
    $scope.BUILD = Config.BUILD
    $scope.data = Data

    $scope.showDelete = false
    $scope.showReorder = false
    $scope.listCanSwipe = true

    $scope.signatures = []

    $log.log('[View] Init', this)

    console.log('[View] Config :: ' + JSON.stringify(Config))

    $scope.toggleDelete = function () {
      $scope.showDelete = !$scope.showDelete
    }

    $scope.delete = function (item) {
      Data.delete(item.id)
      $scope.refresh()
    }

    $scope.refresh = function (filter) {
      $scope.signatures = Data.find(filter || {})
        .map(function (o) {
          // Pretty fields
          o._title = o.name.join(', ')
          o._created = moment(o.created)

          // Pretty data list
          var display = []

          Object.keys(o).forEach(function (k) {
            var label = k.replace(/_/g, ' ')

            if (o.hasOwnProperty(k) && !/^(id|version|created|signature|vCard|_)/i.test(k)) {
              if (angular.isArray(o[k])) {
                display.push({ label: label, value: o[k].join(', ') })

              } else if (angular.isObject(o[k])) {
                display.push({
                  label: label,
                  value: Object.keys(o[k]).map(function (i) {
                    return i.replace(/_/g, ' ') + ': ' + o[k][i]
                  }).join(', ')
                })

              } else {
                display.push({ label: label, value: o[k] })
              }
            }
          })

          o._display = display

          // done
          return o
        })
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
