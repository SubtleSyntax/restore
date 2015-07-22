/* global angular, vCard */
'use strict'
angular.module('main')
  .factory('Data', function ($window, $q, $log, Config, Barcode, Signature) {
    var Data = function () {
      this.debug = $log.debug || console.debug || console.log
      this.reset()

    // this.debug($window.localStorage.records)
    }

    // Database r/w

    Data.prototype.isValid = function () {
      return this.currentScan && this.currentSignature
    }

    Data.prototype.reset = function () {
      this.currentScan = null
      this.currentSignature = null
    }

    Data.prototype.set = function (key, value) {
      $window.localStorage[key] = JSON.stringify(value)
    }

    Data.prototype.get = function (key, deflt) {
      return JSON.parse($window.localStorage[key] || 'null') || deflt || {}
    }

    Data.prototype.save = function () {
      var q = $q.defer()
      var record

      if (this.isValid()) {
        record = angular.copy(this.currentScan)

        record.id = Date.now()
        record.created = new Date().toISOString()
        record.signature = this.currentSignature

        this.insert(record)
        q.resolve(record)
      } else {
        q.reject(Error('Current scan and signature required to save', 1000))
      }

      return q.promise
    }

    Data.prototype.saveAll = function (records) {
      if (angular.isArray(records)) {
        this.set('records', records)
      }
    }

    Data.prototype.getAll = function () {
      return this.get('records', [])
    }

    Data.prototype.find = function (params) {
      if (typeof params === 'string' || typeof params === 'number') {
        params = { id: params }
      }

      return this.getAll().filter(function (r) {
        return Object.keys(params || {}).every(function (k) {
          return String(r[k]) === String(params[k])
        })
      })
    }

    Data.prototype.insert = function (record) {
      var records = this.getAll()
      records.push(record)
      this.saveAll(records)
    }

    Data.prototype.delete = function (params) {
      if (typeof params === 'string' || typeof params === 'number') {
        params = { id: params }
      }

      this.set('records', this.getAll().filter(function (r) {
        return !Object.keys(params).every(function (k) {
            return String(r[k]) === String(params[k])
          })
      }))
    }

    // Scanning

    Data.prototype.scan = function () {
      this.currentScan = null

      return Barcode.scan()
        .then(angular.bind(this, function (result) {
          this.debug('[Data] Raw scan result: ' + JSON.stringify(result))

          // Todo: format / validate scanned data
          if (!result || result.cancelled) {
            return $q.reject(Error('Cancelled by user', 1001))
          }

          // Removed this validation. As long as the scan results in a vCard,
          // we don't really card if it's a QR
          // if (result.format !== 'QR_CODE') {
          //   return $q.reject(Error('Not a QR Code', 1002))
          // }

          if (!/^BEGIN:VCARD/i.test(result.text)) {
            return $q.reject(Error('Scanned data is not a vCard', 1003))
          }

          // Parse the data
          var data = vCard.parse(result.text) // result.text.split('\n')
          var labels = { 'n': 'name', 'fn': 'fullname', 'adr': 'address', 'tel': 'telephone' }
          var required = { 'n': true }
          var formatted = { vCard: result.text }
          var k

          // this.debug('[Data] Formatted data: ' + JSON.stringify(data))

          // Validate required
          for (k in required) {
            if (!(data[k] && data[k][0] && data[k][0].value)) {
              return $q.reject(Error(labels[k] + ' is required', 1010))
            }
          }

          // Add included fields
          var processValue = function (value) {
            if (value.length > 1) {
              // array of values
              if (value.every(function (o) { return o.meta && o.meta.type })) {
                // Each sub object has a type listed
                var temp = {}
                value.forEach(function (o) {
                  temp[o.meta.type[0].toLowerCase().replace(/[^\w]/g, '_')] = o.value
                })
                return temp

              } else {
                // no types
                return value.map(function (o) {
                  return o.value
                })
              }
            } else {
              // simple key and value
              return angular.isArray(value[0].value)
                ? value[0].value.filter(function (o) { return !!o })
                : value[0].value
            }
          }

          for (k in data) {
            if (data.hasOwnProperty(k)) {
              this.debug('[Data] ' + k + ' -> ' + JSON.stringify(data[k]))
              formatted[labels[k] || k] = processValue(data[k])
            }
          }

          // Find number in house if it's there
          var match = formatted.vCard.match(/([A-Z]+):num(ber)? ?in ?house[^\d]+(\d+)/i)
          if (match) {
            this.debug('[Data] Number in house found in field ' + match[1] + ': ' + match[3])

            formatted.number_in_house = match[3]
            formatted.number_in_house_field = match[1]
          }

          // Done Parsing

          this.currentScan = formatted
          return this.currentScan
        }))
    }

    // Signing

    Data.prototype.sign = function (title, htmlPage) {
      this.currentSignature = null

      return Signature.getSignature(title, htmlPage)
        .then(angular.bind(this, function (result) {
          this.debug('[Data] Sign complete')

          // Format / validate signature data

          if (!result) {
            return $q.reject(Error('Cancelled by user', 1001))
          }

          // Convert raw canvas data to a base64 encoded png
          var canvas = document.createElement('canvas')
          var ctx = canvas.getContext('2d')

          canvas.width = result.width
          canvas.height = result.height
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.putImageData(result, 0, 0)

          this.currentSignature = canvas.toDataURL('image/png')
          return this.currentSignature

          // Let's resize this?
          // var resizer = new Image()
          //   , q = $q.defer()

          // resizer.onload = function () {
          //   var reCanvas = document.createElement('canvas')

          //   reCanvas.width = canvas.width / 2
          //   reCanvas.height = canvas.height / 2

          //   reCanvas.getContext('2d').drawImage(resizer, 0, 0, reCanvas.width, reCanvas.height)

          //   this.currentSignature = reCanvas.toDataURL('image/jpeg', 0.5)
          //   q.resolve(this.currentSignature)
          // }

          // resizer.src = this.currentSignature

        // return q.promise
        }))
    }

    // Singleton Instance
    return new Data()
  })
