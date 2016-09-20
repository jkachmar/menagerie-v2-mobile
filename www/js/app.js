var resultDiv;
var socket;
var _device;
var _location;
var _assetTag;
var _form;

var	SERVER_URL = '';
var WEB_APP_TOKEN = '';

window.cordova = true; // Fix iOS status bar overlap

/** Common functions ---------------------------------------------------------*/
function sanitizePayload(result) {
  // TODO: for realz
  var sanitized = result;
  sanitized.text = result.text.replace('/find/device/', '');
  sanitized.text = result.text.replace('/find/location/', '');
  sanitized.barcode = result.text;
  return sanitized;
}

function scanBarcode(checkedFieldId) {
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      var s = 'Result: ' + result.text + '<br/>' +
            'Format: ' + result.format + '<br/>' +
            'Cancelled: ' + result.cancelled;
      var sanitizedResult = sanitizePayload(result);
      document.getElementById(checkedFieldId).value = result;
    },
    function (error) {
      ons.notification.alert('Scanning failed: ' + error);
    }
  );
}


/** Add Device tab -----------------------------------------------------------*/

var addDeviceScan = function() {
  // HACK: this could almost definitely be improved
  var checkedFieldId =
        document.querySelector('input[name=add-device-selector]:checked')
        .parentNode
        .parentNode
        .nextElementSibling
        .getAttribute('id');
  scanBarcode(checkedFieldId);
};

var addDeviceSubmit = function() {
  var deviceId = document.getElementById('add-device-id').value;
  var deviceLocation = document.getElementById('add-device-location').value;
  var deviceMac = document.getElementById('add-device-mac').value;

	var payload = {
		alias: deviceMac,
		location: deviceLocation,
		assetTag: deviceId
	};

  if (SERVER_URL) {
    console.log(SERVER_URL);

  } else {
    ons.notification.alert('No Server URL specified');
  }
};

/** Configuration tab --------------------------------------------------------*/

function getToken() {
  console.log('WEB APP TOKEN', WEB_APP_TOKEN);
  return 'Bearer ' + WEB_APP_TOKEN;
}

function setAuthorizationToken(xhr) {
  xhr.setRequestHeader('Authorization', getToken());
}

function notifyReading(endpoint, payload){
  console.log('=> NOTIFY READING', endpoint, JSON.stringify(payload));

  socket.emit('/thing/socketes', payload);

  resultDiv.innerHTML = endpoint;

  $.ajax({
    url: endpoint,
    data: payload,
    type: 'POST',
    crossDomain: true,
    dataType: 'json',
    beforeSend: setAuthorizationToken,
  }).done(function(res) {
    console.log('AJAX response: ', JSON.stringify(res));
    if (res.success) {
      resultDiv.innerHTML = 'Transaction complete';
    } else {
      resultDiv.innerHTML = res.message; 
    }
  }).fail(function(e) {
    console.error('ERROR %s', e, JSON.stringify(e));
    resultDiv.innerHTML = '<h4>Error</h4><br/><code>' + JSON.stringify(e, null, 4) + '</code>';
  });

  console.log('POST', endpoint, JSON.stringify(payload));
}

// Handle token auth and server URL
var authHandler = function() {
  SERVER_URL = document.getElementById('config-server-field').value;
  WEB_APP_TOKEN = document.getElementById('config-server-field').value;

  if (SERVER_URL && WEB_APP_TOKEN) {
    document.getElementById('add-device-submit-btn').innerHTML = 'Connecting...';
    notifyReading('', payload);

    // TODO: uncomment this when the socket stuff is implemented
    // createSocket(SERVER_URL);
  } else {
    ons.notification.alert('Incomplete authentication fields');
  }
};

/** Websocket Stuff ----------------------------------------------------------*/

function createSocket(url) {
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

  socket.on('connect', function () {
    console.log('Connected');
    document.getElementById('add-device-submit-btn').setAttribute('disabled', '');
    document.getElementById('add-device-submit-btn').innerHTML = 'Submit';
  });

  socket.on('error', function(e){
    document.getElementById('add-device-submit-btn').innerHTML = 'Error connecting!';
  });

  socket.on('/thing/barcode-scann', function(payload){
    console.log('UPDATED: ', JSON.stringify(payload));
    resultDiv.innerHTML = payload.success ? '<p>All GOOD</p>' : '<p>Error :(</p>';
  });

  if (socket.doConnect) {
    socket.connect();
    console.log('Socket connecting');
  }

  window.socket = socket;
}

/** Old code -----------------------------------------------------------------*/

var startScan = function() {
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      var s = "Result: " + result.text + "<br/>" +
      "Format: " + result.format + "<br/>" +
      "Cancelled: " + result.cancelled;
      result = sanitizePayload(result);
      handleReading(result);
    },
    function (error) {
      alert("Scanning failed: " + error);
    }
	);
};

function _clear(e) {
	e && e.preventDefault();

	_device.val('');
	_location.val('');
	_assetTag.val('');

	return false;
}

/** Validations -------------------------------------------------------------*/

function handleReading(result) {
  var validations = {
    location: /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/,
    device: /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/,
    assetTag: /^[0-9]{6}$/,
  };

  var reg = false;
  var valid = false;
  Object.keys(validations).map(function(key){
    reg = validations[key];
    if(!reg.test(result.text)) {
      return;
    }
    $('#' + key).val(result.text);
    valid = true;
  });

  if (!valid) {
    ons.notification.alert('Invalid barcode input');
  }
}
