var deployDevice = (function() {
  // bind copy of SERVER_URL from config module
  var server = cfg.SERVER_URL;

  var deployDeviceScan = function() {
    var checkedFieldId = util.getCheckedFieldId('deploy-device-selector');
    util.scanBarcode(checkedFieldId);
  };

  // Submit button function, get values from all input fields, handle
  // appropriately, and submit to the server
  var submitDeployment = function() {
    var endpoint = cfg.ENDPOINTS.checkoutDevice;
    var fields = {
      deployment: 'deploy-deployment-id',
      device: 'deploy-device-id',
      location: 'deploy-location-id',
    };

    // Make a JSON payload from the input fields
    payload = util.makePayload(fields);

    util.submit(server, endpoint, payload);
  };

  return { scan: deployDeviceScan,
           submit: submitDeployment
         };

})();


// /** Deploy Device tab --------------------------------------------------------*/
// // TODO: VERIFY FUNCTIONALITY
// var deployDeviceScan = function() {
//   var checkedFieldId = util.getCheckedFieldId('deploy-device-selector');
//   util.scanBarcode(checkedFieldId);
// };

// var deployDeviceSubmit = function() {
//   var fields = {
//     deviceId: 'deploy-device-id',
//     deviceLocation: 'deploy-device-location',
//   };

//   var payload = util.makePayload(fields);

//   deployDevice.submit(SERVER_URL, payload);
// };
