var WEB_APP_TOKEN = '';
var	SERVER_URL = ''; // for testing purposes

var ENDPOINTS = {
  addDevice: '/devices',
  getDeviceTypes: '/devices/devicetypes',
  search: '/devices/search',
};

var SUBMIT_BUTTON_LIST = [
  'add-device-submit-btn',
  'deploy-device-submit-btn',
  'search-device-submit-btn',
];

/** Device Type List Handler -------------------------------------------------*/
var getDeviceTypes = function() {
  $.ajax({
    url: SERVER_URL + ENDPOINTS.getDeviceTypes,
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
// TODO: VERIFY FUNCTIONALITY
var addDeviceScan = function() {
  var checkedFieldId = util.getCheckedFieldId('add-device-selector');
  util.scanBarcode(checkedFieldId);
};

var addDeviceSubmit = function() {
  var fields = {
    deviceType: 'add-device-type',
    deviceId: 'add-device-id',
    deviceLocation: 'add-device-location',
  };

  var payload = util.makePayload(fields);
  console.log(payload);

  delete fields.deviceType;
  addDevice.submit(SERVER_URL, ENDPOINTS.addDevice, payload, fields);
};

/** Deploy Device tab --------------------------------------------------------*/
// TODO: VERIFY FUNCTIONALITY
var deployDeviceScan = function() {
  var checkedFieldId = util.getCheckedFieldId('deploy-device-selector');
  util.scanBarcode(checkedFieldId);
};

var deployDeviceSubmit = function() {
  var fields = {
    deviceId: 'deploy-device-id',
    deviceLocation: 'deploy-device-location',
  };

  var payload = util.makePayload(fields);

  deployDevice.submit(SERVER_URL, payload);
};

/** Search Menagerie tab -------------------------------------------------------*/
// TODO: VERIFY FUNCTIONALITY

// TODO: Rename to reflect device-agnostic searches
var searchDeviceScan = function() {
  util.scanBarcode('search-device-id');
}

// TODO: Rename to reflect device-agnostic searches
var searchDeviceSubmit = function() {
  var endpoint = '/thing/find'
  var searchField = document.getElementById('search-device-id').value;

  searchMenagerie.submit(SERVER_URL, endpoint, searchField);
}

/** Configuration tab --------------------------------------------------------*/
// TODO: REFACTOR
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

