var addDevice = (function() {
  // bind copy of SERVER_URL from config module
  var server = cfg.SERVER_URL;

  // local storage object for device name/id
  var deviceType = {};
  // Gets a list of device types from Menagerie and displays them as a modal
  // of tappable list elements, where the 'friendly name' corresponds to a
  // Menagerie device typeId
  var getDeviceTypes = function() {
    var endpoint = cfg.ENDPOINTS.getDeviceTypes;

    // GET -> device type from Menagerie
    util.get(server, endpoint,
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

        // Display the list of device names to the 'add-device-list' modal
        document.getElementById('add-device-type-list').innerHTML = list;
        document.getElementById('add-device-type-dialog').show();

        $('#add-device-type-list').on('click', 'ons-list-item', function(){
          document.getElementById('add-device-type').value = this.textContent;
          deviceType.name = this.textContent;

          // Filter for a device typeId using the device name, assume single match
          deviceType.id = res.records.filter(function(each) {
            return each.name === deviceType.name;
          })[0].id;

          document.getElementById('add-device-type-dialog').hide();
        });
      });
  };

  var addDeviceScan = function() {
    var checkedFieldId = util.getCheckedFieldId('add-device-selector');
    util.scanBarcode(checkedFieldId);
  };

  // Submit button function, get values from all input fields, handle
  // appropriately, and submit to the server
  var submitDevice = function() {
    var endpoint = cfg.ENDPOINTS.device;
    var fields = {
      name: 'add-device-name',
      assetTag: 'add-device-tag',
      deviceId: 'add-device-id'
    };

    // Make a JSON payload from the input fields
    var payload = util.makePayload(fields);
    payload.type = deviceType.id; // Get device typeId from its name

    util.submit(server, endpoint, payload);
  };

  return { scan: addDeviceScan,
           submit: submitDevice,
           getTypes: getDeviceTypes
         };
})();
