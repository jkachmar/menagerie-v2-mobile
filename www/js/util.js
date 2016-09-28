var util = (function() {

  /** Common AJAX Functions -----------------------------------------------*/

  var getFromMenagerie = function(server, endpoint, cbDone, cbFail) {
    var url = server + endpoint;

    // GET -> device type from Menagerie using global SERVER_URL and ENDPOINTS
    $.ajax({
      url: url,
      type: 'GET',
      crossDomain: true,
      dataType: 'json',
    }).done(cbDone).fail(cbFail);
  }

  var postToMenagerie = function(server, endpoint, payload, cbDone, cbFail) {
    var url = server + endpoint;

    $.ajax({
      url: url,
      data: JSON.stringify(payload),
      contentType: 'application/json',
      type: 'POST',
      crossDomain: true,
      dataType: 'json',
    }).done(cbDone).fail(cbFail);
  }

  /** Common Utility Functions -----------------------------------------------*/
  var sanitizePayload = function(result) {
    // TODO: for realz
    var sanitized = result;
    sanitized.text = result.text.replace('/find/device/', '');
    sanitized.text = result.text.replace('/find/location/', '');
    sanitized.barcode = result.text;
    return sanitized;
  }

  var getCheckedFieldId = function(inputFieldName) {
    var checkedFieldId =
          document.querySelector('input[name=' + inputFieldName + ']:checked')
          .parentNode
          .parentNode
          .nextElementSibling
          .getAttribute('id');
    return checkedFieldId;
  }

  var scanBarcode = function(checkedFieldId) {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
        sanitizedResult = sanitizePayload(result);
        document.getElementById(checkedFieldId).value = sanitizedResult.text;
      },
      function (error) {
        ons.notification.alert('Scanning failed: ' + error);
      }
    );
  }

  var makePayload = function(fields) {
    var payload = {};
    Object.keys(fields).map(function(k) {
      var v = document.getElementById(fields[k]).value;
      payload[k] = v;
    });

    return payload;
  }

/** Websocket Stuff ----------------------------------------------------------*/
  var socket;

  function createSocket(url, slug) {
    if (socket && socket.io.uri === url) {
      if (socket.connected) {
        console.log('Socket connected');
        return;
      }
    }

    if (socket) {
      socket.close();
      socket.removeAllListeners();
      socket.doConnect = true;
      console.log('Socket reset');
    }

    socket = io(url, {
      transports: [
        'polling',
        'websocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling',
      ],
    });

    // If we're connected, enable form submission
    socket.on('connect', function () {
      console.log('Connected');
      SUBMIT_BUTTON_LIST.forEach(function(each) {
        document.getElementById(each).removeAttribute('disabled', '');
      });
    });

    // If there was a connection error, disable form submission
    socket.on('error', function(e){
      ons.notification.alert('Error connecting to Menagerie!');
      SUBMIT_BUTTON_LIST.forEach(function(each) {
        document.getElementById(each).setAttribute('disabled', '');
      });
    });

    socket.on(slug, function(payload){
      console.log('UPDATED: ', JSON.stringify(payload));
      var response = payload.success ? 'All Good!' : 'Error';
      ons.notification.alert(response);
    });

    if (socket.doConnect) {
      socket.connect();
      console.log('Socket connecting');
    }
  }

  return {
    get: getFromMenagerie,
    post: postToMenagerie,
    sanitizePayload: sanitizePayload,
    getCheckedFieldId: getCheckedFieldId,
    scanBarcode: scanBarcode,
    makePayload: makePayload,
  };
})();
