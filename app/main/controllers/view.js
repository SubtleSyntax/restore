/* global angular, moment */
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
      Data.delete(item.id)
      $scope.refresh()
    }

    $scope.refresh = function (filter) {
      $scope.signatures = Data.find(filter || {})
        .map(function (o) {
          // Pretty fields
          o._title = o.name.join(', ')
          o._created = moment(o.created)
          o._createdPretty = o._created.format('M/D/YY H:mm')

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

    $scope.exportEmail = function () {
      if ($scope.signatures && $scope.signatures.length) {
        // var json = JSON.stringify($scope.signatures)
        // var base64 = window.btoa(json)
        // var base64 = window.btoa(json)

        var count = 1
        var html = $scope.signatures.map(function (sig) {
          var sigHtml =
            '<div>' +
              '<div>Contact ' + count++ + '</div>' +
              '<div>' +
                sig._display.map(function (item) {
                  return '<b>' + item.label + '</b>: ' + item.value + '<br>'
                }).join(' ') +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div>Signature</div>' +
              '<div>' +
                '<img src="' + sig.signature + '" style="width:100%">' +
              '</div>' +
            '</div>'

          return sigHtml
        }).join('<hr>')

        var csv = $scope.signatures[0]._display.map(function (item) { return item.label }).join('|') +
          '\\r\\n' +
          $scope.signatures.map(function (sig) {
            return sig._display.map(function (item) { return item.value }).join('|') +
              sig.signature
          }).join('\\r\\n')

        var files = $scope.signatures.map(function (sig) {
          return [
            sig._title.replace(/[^\w]+/g, '_') + '_' + sig._created.format('YYYYMMDD') + '_signature.png',
            sig.signature.replace(/^data\:image\/png\;base64\,/, '')
          ]
        })

        files.push(['export.csv', window.btoa(csv)])

        Email.open({
          subject: 'Signature Export from Re:Store App',
          body: html,
          isHtml: true,
          attachmentsData: files
        }).then(function (derp) { console.log(derp) })
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
