var searchMenagerie = (function() {

  var searchMenagerieScan = function() {
    util.scanBarcode('search-device-id');
  };

  var searchMenagerieSubmit = function() {
    // TODO: This is dumb for the sake of reusing code, fix 'makePayload'
    var searchId = util.makePayload({id: 'search-device-id'}).id;
    util.get(
      SERVER_URL,
      ENDPOINTS.search + '/' + searchId,
      console.log, console.log);

    util.get(
      SERVER_URL,
      ENDPOINTS.search + '/' + searchId,
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
