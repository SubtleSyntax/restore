/* global angular, PouchDB, LocalFileSystem, blobUtil, moment, vCard */
'use strict'
angular.module('main')
  .factory('Data', function ($window, $q, $log, Config, Barcode, Signature, pouchDB) {
    var Data = function () {
      this.debug = $log.debug || console.debug || console.log
      this.reset()

      this.db = new pouchDB('restore', { adapter: 'websql' }) // eslint-disable-line

      PouchDB.debug.enable('pouchdb:api')
      this.db.info().then(function (info) {
        console.debug('PouchDB info: ' + JSON.stringify(info))
      })
    }

    // Database r/w

    Data.prototype.isValid = function () {
      return this.currentScan && this.currentSignature
    }

    Data.prototype.reset = function () {
      this.currentScan = null
      this.currentSignature = null
    }

    Data.prototype.save = function () {
      if (!this.isValid()) {
        return $q.reject(Error('Current scan and signature required to save', 1000))
      }

      var record = angular.copy(this.currentScan)
      var idname = record.name.join('_').replace(/[^\w]+/g, '_')

      record._id = Date.now() + '_' + idname
      record.created = new Date().toISOString()
      record._attachments = {}

      var filename = record._id + '_signature.png'

      record._attachments[filename] = {
        'content_type': 'image/png',
        'data': this.currentSignature.replace(/^data\:image\/png\;base64\,/, '')
      }

      return this.db.put(record)
    }

    Data.prototype.getAll = function () {
      return this.db.allDocs({
        include_docs: true,
        attachments: true
      }).then(angular.bind(this, function (result) {
        return result.rows
          .map(function (row) { return row.doc })
          .map(this.getDisplayFields)
      }))
    }

    Data.prototype.get = function (id) {
      return this.db.get(id, {
        attachments: true,
        binary: true
      }).then(angular.bind(this, function (doc) {
        return this.getDisplayFields(doc)
      }))
    }

    Data.prototype.delete = function (doc, rev) {
      return this.db.remove(doc, rev)
    }

    // Docs

    Data.prototype.getDisplayFields = function (doc) {
      // Pretty fields
      doc._title = doc.name.join(', ')
      doc._created = moment(doc.created)
      doc._createdPretty = doc._created.format('M/D/YY H:mm')

      // Pretty data list
      var display = []

      Object.keys(doc).forEach(function (k) {
        var label = k.replace(/_/g, ' ')

        if (doc.hasOwnProperty(k) && !/^(id|version|created|signature|vCard|_)/i.test(k)) {
          if (angular.isArray(doc[k])) {
            display.push({ label: label, value: doc[k].join(', ') })

          } else if (angular.isObject(doc[k])) {
            display.push({
              label: label,
              value: Object.keys(doc[k]).map(function (i) {
                return i.replace(/_/g, ' ') + ': ' + doc[k][i]
              }).join(', ')
            })

          } else {
            display.push({ label: label, value: doc[k] })
          }
        }
      })

      doc._display = display

      // Signature
      if (doc._attachments) {
        var sig = doc._attachments[Object.keys(doc._attachments)[0]]
        doc._signature = 'data:' + sig.content_type + ';base64,' + sig.data
      }

      // done
      return doc
    }

    Data.prototype.saveSignature = function (doc) {
      return this.get(doc._id || doc)
        .then(angular.bind(this, function (doc) {
          var filename = Object.keys(doc._attachments)[0]
          var data = doc._attachments[filename]

          return blobUtil.base64StringToBlob(data.data, data.content_type)
            .then(angular.bind(this, function (blob) {
              return this.saveFile(filename, blob)
            }))
            .catch(function (err) {
              console.error('[Data.saveSignature] error: ' + err)
            })
        }))
    }

    Data.prototype.exportAll = function () {
      return this.getAll()
        .then(angular.bind(this, function (docs) {
          var fileExports = []

          // Generate CSV
          var csv = docs[0]._display.map(function (item) { return item.label }).join('|') +
            '\r\n' +
            docs.map(function (sig) {
              return sig._display.map(function (item) { return item.value }).join('|') // + sig.signature
            }).join('\r\n')

          fileExports.push(this.saveFile('export_' + moment().format('YYYYMMDD') + '.csv', csv))

          // Add signatures
          docs.forEach(angular.bind(this, function (doc) {
            fileExports.push(this.saveSignature(doc))
          }))

          return $q.all(fileExports)
        }))
    }

    // File IO

    Data.prototype.saveFile = function (filename, data) {
      var root = '/mnt/sdcard'
      var path = 'ReStore'

      return $q(function (resolve, reject) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
          function (fs) {
            fs.root.getDirectory(path, { create: true, exclusive: false },
              function (dir) {
                dir.getFile(filename, { create: true, exclusive: false },
                  function (fo) {
                    fo.createWriter(
                      function (writer) {
                        writer.write(data)
                        writer.onwriteend = function (e) {
                          resolve(root + fo.fullPath)
                        }
                      },
                      function (err) { reject('Error createWriter: ' + err) }
                    )
                  },
                  function (err) { reject('Error getFile: ' + err) }
                )
              },
              function (err) { reject('Error getDirectory: ' + err) }
            )
          },
          function (err) { reject('Error requestFileSystem: ' + err) }
        )
      })
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
        }))
    }

    // Singleton Instance
    return new Data()
  })
