'use strict';
angular.module('main')
.factory('Data', function ($q, $log, $indexedDB, Config, Barcode, Signature) {

  var Data = function (params) {
    this.debug = function () {};

    this.db = $indexedDB.objectStore('signatures');
    this.currentScan = null;
    this.currentSignature = null;

    this.set(params);
  };

  Data.prototype.set = function (params) {
    params = params || {};

    if (params.debug) {
      this.debug = $log.info;
    }
  };

  // Database r/w

  Data.prototype.isValid = function () {
    return this.currentScan && this.currentSignature;
  };


  Data.prototype.save = function () {
    if (this.isValid()) {
      return this.db.insert({
        data: this.currentScan,
        signature: this.currentSignature,
        created: Date.now()
      });
    } else {
      return $q.reject(Error('Current scan and signature required to save'));
    }
  };


  Data.prototype.find = function (keyOrIndex, keyIfIndex) {
    return this.db.find(keyOrIndex, keyIfIndex);
  };

  Data.prototype.getAll = function () {
    return this.db.getAll();
  };


  // Scanning

  Data.prototype.scan = function () {
    this.currentScan = null;

    return Barcode.scan()
      .then(angular.bind(this, function (result) {
        console.log('[Data] Raw scan result', result);

        // Todo: format / validate scanned data

        this.currentScan = result;
        return result;
      }));
  };

  // Signing

  Data.prototype.sign = function (title, htmlPage) {
    this.currentSignature = null;

    return Signature.getSignature(title, htmlPage)
      .then(angular.bind(this, function (result) {
        console.log('[Data] Raw sign result', result);

        // Todo: format / validate signature data

        if (!result) {
          return $q.reject(Error('cancelled')); // User clicked cancel, we got no image data.
        }

        var canvas = document.getElementById('signature'),
        ctx = canvas.getContext('2d');
        canvas.width = result.width;
        canvas.height = result.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(result, 0, 0);


        this.currentSignature = canvas.toDataURL('image/png');
        return this.currentSignature;
      }));
  };



  // Singleton Instance
  return new Data();
});

