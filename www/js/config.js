var cfg = (function() {
  var ENDPOINTS = {
    device: '/device', // POST
    checkoutDevice: '/deployment/check-out', // POST - deployment
    getDeviceTypes: '/devicetype', // GET
    search: '/thing/find', // GET
    status: '/health' // GET
  };

  var SUBMIT_BUTTON_LIST = [
    'add-device-submit-btn',
    'deploy-device-submit-btn',
    'search-device-submit-btn',
    'update-device-submit-btn',
  ];

  /** Configuration tab --------------------------------------------------------*/
  // Handle token auth and server URL
  var authHandler = function() {
    SERVER_URL = document.getElementById('config-server-field').value;
    WEB_APP_TOKEN = document.getElementById('config-token-field').value;

    util.get(
      SERVER_URL,
      ENDPOINTS.status,
      function(res) {
        SUBMIT_BUTTON_LIST.forEach(function(each) {
          document.getElementById(each).removeAttribute('disabled', '');
        });
      }, function(res) {
        SERVER_URL = ''; // Clear server URL if invalid
        ons.notification.alert('Unable to connect to server :(');
      });
  };

  return { ENDPOINTS: ENDPOINTS,
           authHandler: authHandler
         };
})();
