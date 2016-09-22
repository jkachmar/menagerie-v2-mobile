var resultDiv;
var socket;
var _device;
var _location;
var _assetTag;
var _form;

var	SERVER_URL = 'http://localhost:8080'; // for testing purposes
var WEB_APP_TOKEN = '';
var ENDPOINT = {
  deviceType: '/devices/devicetypes',
  barcodeScan: '/thing/barcode-scann',
};

var SUBMIT_BUTTON_LIST = [
  'add-device-submit-btn',
  'deploy-device-submit-btn',
  'search-device-submit-btn',
];

window.cordova = true; // Fix iOS status bar overlap

var testObject = {};

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
  return 'test';
}

// function scanBarcode(inputFieldId) {
//   cordova.plugins.barcodeScanner.scan(
//     function (result) {
//       var s = 'Result: ' + result.text + '<br/>' +
//             'Format: ' + result.format + '<br/>' +
//             'Cancelled: ' + result.cancelled;
//       var sanitizedResult = sanitizePayload(result);
//       return result;
//     },
//     function (error) {
//       ons.notification.alert('Scanning failed: ' + error);
//       return '';
//     }
//   );
// }

function notifyReading(url, endpoint, payload){
  console.log('=> NOTIFY READING', endpoint, JSON.stringify(payload));

  socket.emit('/thing/socketes', payload);

  $.ajax({
    url: SERVER_URL + ENDPOINTS.barcodeScan,
    data: payload,
    type: 'POST',
    crossDomain: true,
    dataType: 'json',
    beforeSend: setAuthorizationToken,
  }).done(function(res) {
    console.log('AJAX response: ', JSON.stringify(res));
    if (res.success) {
      // TODO: don't use alerts for status updates
      ons.notification.alert('Transaction complete');
    } else {
      // TODO: don't use alerts for status updates
      ons.notification.alert(res.message);
    }
  }).fail(function(e) {
    // TODO: see if this message needs to be pretty-printed
    ons.notification.alert(JSON.stringify(e, null, 4));
    console.error('ERROR %s', e, JSON.stringify(e));
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

/** Device Type List Handler -------------------------------------------------*/

var getDeviceTypes = function() {
  $.ajax({
    url: SERVER_URL + ENDPOINT.deviceType,
    type: 'GET',
    crossDomain: true,
    dataType: 'json',
  }).done(function(res) {
    // HACK: there is definitely a better way to do this
    var list = '';
    res.forEach(function(each) {
      var item =
            '<ons-list-item>' +
            each.deviceType +
            '</ons-list-item>';
      list += item;
    });

    document.getElementById('add-device-type-list').innerHTML = list;
    document.getElementById('add-device-type-dialog').show();

    $('#add-device-type-list').on('click', 'ons-list-item', function(event){
      document.getElementById('add-device-type').value = this.textContent;
      document.getElementById('add-device-type-dialog').hide();
    });
  });
}


/** Add Device tab -----------------------------------------------------------*/

var addDeviceScan = function() {
  var checkedFieldId = getCheckedFieldId('add-device-selector');
  var barcodeInput = scanBarcode();
  document.getElementById(checkedFieldId).value = barcodeInput;
};

var addDeviceSubmit = function() {
  var fields = {
    deviceType: 'add-device-type',
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
    // TODO: uncomment this when the socket stuff is implemented
    SUBMIT_BUTTON_LIST.forEach(function(each) {
      document.getElementById(each).removeAttribute('disabled', '');
    });
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

  socket.on('/thing/barcode-scann', function(payload){
    console.log('UPDATED: ', JSON.stringify(payload));
    var response = payload.success ? 'All Good!' : 'Error';
    ons.notification.alert(response);
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
