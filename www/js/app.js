var resultDiv;
var socket;
var _device;
var _location;
var _assetTag;
var _form;

var	SERVER_URL = '';
var WEB_APP_TOKEN = '';
var ENDPOINT = '/thing/barcode-scann';

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

function getCheckedFieldId(inputFieldName) {
  var checkedFieldId =
        document.querySelector('input[name=' + inputFieldName + ']:checked')
        .parentNode
        .parentNode
        .nextElementSibling
        .getAttribute('id');
  return checkedFieldId;
}

function scanBarcode(inputFieldId) {
  // document.getElementById(inputFieldId).value = 'test';
  return 'test';
}


// function scanBarcode(inputFieldId) {
//   cordova.plugins.barcodeScanner.scan(
//     function (result) {
//       var s = 'Result: ' + result.text + '<br/>' +
//             'Format: ' + result.format + '<br/>' +
//             'Cancelled: ' + result.cancelled;
//       var sanitizedResult = sanitizePayload(result);
//       document.getElementById(inputFieldId).value = result;
//     },
//     function (error) {
//       ons.notification.alert('Scanning failed: ' + error);
//     }
//   );
// }

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

function makePayload(fields) {
  var payload = {};
  Object.keys(fields).map(function(k) {
    var v = document.getElementById(fields[k]).value;
    payload[k] = v;
  });

  return payload;
}

function clearFields(fields) {
  Object.keys(fields).forEach(function(k) {
    document.getElementById(fields[k]).value = '';
  });
}

function submitPayload(payload) {
  if (SERVER_URL) {
    console.log(SERVER_URL);
    // notifyReading(ENDPOINT, payload);
    return true;
  } else {
    ons.notification.alert('No Server URL specified');
    return false;
  }
}

/** Add Device tab -----------------------------------------------------------*/

var addDeviceScan = function() {
  var checkedFieldId = getCheckedFieldId('add-device-selector');
  var barcodeInput = scanBarcode();
  document.getElementById(checkedFieldId).value = barcodeInput;
};

var addDeviceSubmit = function() {
  var fields = {
    deviceId: 'add-device-id',
    deviceLocation: 'add-device-location',
  };

  var payload = makePayload(fields);

  if (submitPayload(payload)) {
    clearFields(fields);
  }
};

/** Deploy Device tab --------------------------------------------------------*/

var deployDeviceScan = function() {
  var checkedFieldId = getCheckedFieldId('deploy-device-selector');
  var barcodeInput = scanBarcode();
  document.getElementById(checkedFieldId).value = barcodeInput;
};

var deployDeviceSubmit = function() {
  var fields = {
    deviceId: 'deploy-device-id',
    deviceLocation: 'deploy-device-location',
  };

  var payload = makePayload(fields);

  if (submitPayload(payload)) {
    clearFields(fields);
  }
};

/** Search Device tab --------------------------------------------------------*/

var searchDeviceScan = function() {
  var barcodeInput = scanBarcode();
  document.getElementById('search-device-id').value = barcodeInput;
}

var searchDeviceSubmit = function() {
  var fields = {
    deviceId: 'search-device-id',
  };

  var payload = makePayload(fields);

  if (submitPayload(payload)) {
    clearFields(fields);
  }
}

/** Configuration tab --------------------------------------------------------*/

function getToken() {
  console.log('WEB APP TOKEN', WEB_APP_TOKEN);
  return 'Bearer ' + WEB_APP_TOKEN;
}

function setAuthorizationToken(xhr) {
  xhr.setRequestHeader('Authorization', getToken());
}

// Handle token auth and server URL
var authHandler = function() {
  SERVER_URL = document.getElementById('config-server-field').value;
  WEB_APP_TOKEN = document.getElementById('config-server-field').value;

  if (SERVER_URL && WEB_APP_TOKEN) {
    document.getElementById('add-device-submit-btn').innerHTML = 'Connecting...';
    document.getElementById('deploy-device-submit-btn').innerHTML = 'Connecting...';

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
