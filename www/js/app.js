var WEB_APP_TOKEN = '';
var	SERVER_URL = ''; // for testing purposes

var SLUG = {
  addDevice: '/devices',
  getDeviceTypes: '/devices/devicetypes',
  searchDevice: '/devices/search',
};

var SUBMIT_BUTTON_LIST = [
  'add-device-submit-btn',
  'deploy-device-submit-btn',
  'search-device-submit-btn',
];

/** Device Type List Handler -------------------------------------------------*/
var getDeviceTypes = function() {
  $.ajax({
    url: SERVER_URL + SLUG.getDeviceTypes,
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
  var checkedFieldId = commons.getCheckedFieldId('add-device-selector');
  commons.scanBarcode(checkedFieldId);
};

function addDevice(url, slug, payload, fields){
  var endpoint = url + slug;

  $.ajax({
    url: endpoint,
    data: JSON.stringify(payload),
    contentType: 'application/json',
    type: 'POST',
    crossDomain: true,
    dataType: 'json',
  }).done(function(res) {
    console.log('AJAX response: ', JSON.stringify(res));
    if (res.success) {
      // TODO: don't use alerts for status updates
      ons.notification.alert('Transaction complete');
      clearFields(fields);
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

var addDeviceSubmit = function() {
  var fields = {
    deviceType: 'add-device-type',
    deviceId: 'add-device-id',
    deviceLocation: 'add-device-location',
  };

  var payload = commons.makePayload(fields);
  console.log(payload);

  delete fields.deviceType
  addDevice(SERVER_URL, SLUG.addDevice, payload, fields);
};

/** Deploy Device tab --------------------------------------------------------*/
var deployDeviceScan = function() {
  var checkedFieldId = commons.getCheckedFieldId('deploy-device-selector');
  commons.scanBarcode(checkedFieldId);
};

var deployDeviceSubmit = function() {
  var fields = {
    deviceId: 'deploy-device-id',
    deviceLocation: 'deploy-device-location',
  };

  var payload = commons.makePayload(fields);

  // TODO: submitPayload deprecated, fix
  if (submitPayload(payload)) {
    clearFields(fields);
  }
};

/** Search Device tab --------------------------------------------------------*/
var searchDevice = function(url, slug) {
  var endpoint = url + slug;
  $.ajax({
    url: endpoint,
    data: JSON.stringify(payload),
    contentType: 'application/json',
    type: 'GET',
    crossDomain: true,
    dataType: 'json',
  }).done(function(res) {
    console.log(res);
  });
}

var searchDeviceScan = function() {
  commons.scanBarcode('search-device-id');
}

var searchDeviceSubmit = function() {
  var fields = {
    deviceId: 'search-device-id',
  };

  var payload = commons.makePayload(fields);

  // TODO: submitPayload deprecated, fix
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
    SUBMIT_BUTTON_LIST.forEach(function(each) {
      document.getElementById(each).removeAttribute('disabled', '');
    });
    // TODO: uncomment this when the socket stuff is implemented
    // createSocket(SERVER_URL);
  } else {
    ons.notification.alert('Incomplete authentication fields');
  }
};

