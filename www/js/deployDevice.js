var deployDevice = (function() {

  var deployDeviceScan = function() {
    var checkedFieldId = util.getCheckedFieldId('deploy-device-selector');
    util.scanBarcode(checkedFieldId);
  };

  // Submit button function, get values from all input fields, handle
  // appropriately, and submit to the server
  var submitDeployment = function() {
    var fields = {
      deployment: 'deploy-deployment-id',
      device: 'deploy-device-id',
      location: 'deploy-location-id',
    };

    // Make a JSON payload from the input fields
    payload = util.makePayload(fields);

    util.submit(SERVER_URL, ENDPOINTS.addDevice, payload);
  };

  return { scan: deployDeviceScan,
           submit: submitDeployment
         };

})();
