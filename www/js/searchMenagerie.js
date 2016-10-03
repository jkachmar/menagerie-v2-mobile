var searchMenagerie = (function() {
  // bind copy of SERVER_URL from config module
  var server = cfg.SERVER_URL;

  var searchMenagerieScan = function() {
    util.scanBarcode('search-device-id');
  };

  var searchMenagerieSubmit = function() {
    var endpoint = cfg.ENDPOINTS.search + '/';
    endpoint += document.getElementById('search-device-id').value;

    util.get(
      server,
      endpoint,
      function(res) {
        var list;
        if (res.type === 'location') {
          list = locationHandler(res.result);
        } else if (res.type === 'device') {
          list = deviceHandler(res.result);
        }

        // Display the list of device names to the 'add-device-list' modal
        document.getElementById('search-menagerie-list').innerHTML = list;
        document.getElementById('search-menagerie-dialog').show();
      }, function(err) {
        ons.notification.alert(err);
      });
  };

  // HACK: there is definitely a better way to do this
  function toItem(each) {
    return ('<ons-list-item>' +
            each +
            '</ons-list-item>')}

  // HACK: there is definitely a better way to do this
  function locationHandler(loc) {
    var list = '<ons-list-header>Location Name</ons-list-header>';
    list += toItem(loc.description);
    return list;
  }

  // HACK: there is definitely a better way to do this
  function deviceHandler(dev) {
    dev
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
           submit: searchMenagerieSubmit
         };

})();
