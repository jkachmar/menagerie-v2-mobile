var updateDevice = (function() {

  // local storage object for device name/id
  var deviceType = {};

  // Gets a list of device types from Menagerie and displays them as a modal
  // of tappable list elements, where the 'friendly name' corresponds to a
  // Menagerie device typeId
  var getDeviceTypes = function() {
    // GET -> device type from Menagerie using global SERVER_URL and ENDPOINTS
    util.get(
      SERVER_URL,
      ENDPOINTS.getDeviceTypes,
      function(res) {
        // HACK: there is definitely a better way to do this
        var list = '';
        res.records.forEach(function(each) {
          var item =
              '<ons-list-item>' +
              each.name +
              '</ons-list-item>';
          list += item;
        });

        // Display the list of device names to the 'update-device-list' modal
        document.getElementById('update-device-type-list').innerHTML = list;
        document.getElementById('update-device-type-dialog').show();

        $('#update-device-type-list').on('click', 'ons-list-item', function(event){
          document.getElementById('update-device-type').value = this.textContent;
          deviceType.name = this.textContent;

          // Filter for a device typeId using the device name, assume single match
          deviceType.id = res.records.filter(function(each) {
            return each.name === deviceType.name;
          })[0].id;

          document.getElementById('update-device-type-dialog').hide();
        });
      });
  }

  var updateDeviceScan = function() {
    var checkedFieldId = util.getCheckedFieldId('update-device-selector');
    util.scanBarcode(checkedFieldId);
  };

  function updateDevice(server, endpoint, payload){
    // POST -> device update within Menagerie
    util.post(
      server, url, payload,
      function(res) {
        console.log('AJAX response: ', JSON.stringify(res));
        if (res.success) {
          // TODO: don't use alerts for status updates
          ons.notification.alert('Transaction complete');
        } else {
          // TODO: don't use alerts for status updates
          ons.notification.alert(res.message);
        }
      }, function (res) {
        // TODO: see if this message needs to be pretty-printed
        ons.notification.alert(JSON.stringify(e, null, 4));
        console.error('ERROR %s', e, JSON.stringify(e));
      });

    console.log('POST', endpoint, JSON.stringify(payload));
  }

  // Submit button function, get values from all input fields, handle
  // appropriately, and submit to the server
  var submitDevice = function() {
    var fields = {
      name: 'update-device-name',
      assetTag: 'update-device-tag',
      deviceId: 'update-device-id',
    };

    // Make a JSON payload from the input fields
    payload = util.makePayload(fields);
    payload.type = deviceType.id; // Get device typeId from its name

    updateDevice.submit(SERVER_URL, ENDPOINTS.updateDevice, payload);
  };

  return { submit: submitDevice,
           getTypes: getDeviceTypes,
         };

})();
