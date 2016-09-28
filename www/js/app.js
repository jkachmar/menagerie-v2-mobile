var WEB_APP_TOKEN = '';
var	SERVER_URL = '';

var ENDPOINTS = {
  addDevice: '/device', // POST
  checkoutDevice: '/device', // POST - deployment
  getDeviceTypes: '/devicetype', // GET
  search: '/thing/find', // GET
  updateDevice: '/device/update', // POST
};

var SUBMIT_BUTTON_LIST = [
  'add-device-submit-btn',
  'deploy-device-submit-btn',
  'search-device-submit-btn',
  'update-device-submit-btn',
];

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

