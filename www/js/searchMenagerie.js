var searchMenagerie = (function() {
  var searchMenagerieScan = function() {
    util.scanBarcode('search-device-id');
  };

  var searchMenagerieSearch = function(uuid, cb) {
    var endpoint = cfg.ENDPOINTS.search + '/';
    endpoint += uuid;

    util.get(
      SERVER_URL,
      endpoint,
      cb,
      function(err) {
        ons.notification.alert(err);
      });
  };

  var searchMenagerieSubmit = function() {
    var uuid = document.getElementById('search-device-id').value;
    searchMenagerieSearch(uuid, function(res) {
        var list;
        if (res.type === 'location') {
          list = locationHandler(res.result);

        // Menagerie responds with a 'device' even if nothing is found
        } else if (res.type === 'device') {
            // Check if this is a real device (i.e. if a required field exists)
            if (res.result.type)  {
                list = deviceHandler(res.result);
            } else {
                ons.notification.alert("ID Not Found in Menagerie!");
            }
        }

        // Display the list of device names to the 'add-device-list' modal
        document.getElementById('search-menagerie-list').innerHTML = list;
        document.getElementById('search-menagerie-dialog').show();
    });
  };

  // HACK: there is definitely a better way to do this
  function toItem(each) {
    return ('<ons-list-item>' +
            each +
            '</ons-list-item>');
  }

  // HACK: there is definitely a better way to do this
  function locationHandler(loc) {
    var list = '<ons-list-header>Location Name</ons-list-header>';
    list += toItem(loc.description);
    return list;
  }

  // HACK: there is definitely a better way to do this
  function deviceHandler(dev) {
    var list = '<ons-list-header>Device Type</ons-list-header>';
    list += toItem(dev.type.name);

    if (dev.name) {
      list += '<ons-list-header>Device Name</ons-list-header>';
      list += toItem(dev.name);
    }

    if (dev.location.description) {
      list += '<ons-list-header>Device Location</ons-list-header>';
      list += toItem(dev.location.description);
    }

    list += '<ons-list-header>Device Status</ons-list-header>';
    list += toItem(dev.status);

    if (dev.description) {
      list += '<ons-list-header>Device Description</ons-list-header>';
      list += toItem(dev.description);
    }

    return list;
  }

  return { scan: searchMenagerieScan,
           submit: searchMenagerieSubmit,
           search: searchMenagerieSearch
         };
})();
