var util = (function() {
  /** Common AJAX Functions -----------------------------------------------*/
  var getFromMenagerie = function(server, endpoint, cbDone, cbFail) {
    if (server === '') {
      ons.notification.alert('No server has been specified!');
      return;
    }
    var url = server + endpoint;

    // GET -> device type from Menagerie using global SERVER_URL and ENDPOINTS
    $.ajax({
      url: url,
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + WEB_APP_TOKEN);
      },
      crossDomain: true,
      dataType: 'json'
    }).done(cbDone).fail(cbFail);
  };

  var postToMenagerie = function(server, endpoint, payload, cbDone, cbFail) {
    var url = server + endpoint;

    $.ajax({
      url: url,
      data: JSON.stringify(payload),
      contentType: 'application/json',
      type: 'POST',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + WEB_APP_TOKEN);
      },
      crossDomain: true,
      dataType: 'json'
    }).done(cbDone).fail(cbFail);
  };


  var submitPayload = function(server, endpoint, payload) {
    // POST -> device update within Menagerie
    postToMenagerie(
      server, endpoint, payload,
      function(res) {
        console.log('AJAX response: ', JSON.stringify(res));
        // TODO: don't use alerts for status updates
        ons.notification.alert('Transaction complete');
      }, function (res) {
        // TODO: see if this message needs to be pretty-printed
        ons.notification.alert('ERROR %s', JSON.stringify(res, null, 4));
        console.error('ERROR %s', res, JSON.stringify(res));
      });
  };

  /** Common Utility Functions -----------------------------------------------*/
  var sanitizePayload = function(result) {
    // TODO: for realz
    var sanitized = result;
    sanitized.text = result.text.replace('/find/device/', '');
    sanitized.text = result.text.replace('/find/location/', '');
    sanitized.barcode = result.text;
    return sanitized;
  };

  var getCheckedFieldId = function(inputFieldName) {
    var checkedFieldId =
          document.querySelector('input[name=' + inputFieldName + ']:checked')
          .parentNode
          .parentNode
          .nextElementSibling
          .getAttribute('id');
    return checkedFieldId;
  };

  var scanBarcode = function(checkedFieldId) {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        var sanitizedResult = sanitizePayload(result);
        document.getElementById(checkedFieldId).value = sanitizedResult.text;
      },
      function (error) {
        ons.notification.alert('Scanning failed: ' + error);
      }
    );
  };

  var makePayload = function(fields) {
    var payload = {};
    Object.keys(fields).map(function(k) {
      var v = document.getElementById(fields[k]).value;
      payload[k] = v;
    });

    return payload;
  };

  return {
    get: getFromMenagerie,
    post: postToMenagerie,
    submit: submitPayload,
    sanitizePayload: sanitizePayload,
    getCheckedFieldId: getCheckedFieldId,
    scanBarcode: scanBarcode,
    makePayload: makePayload
  };
})();
