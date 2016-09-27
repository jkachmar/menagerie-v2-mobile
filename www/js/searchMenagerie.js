var searchMenagerie = (function() {

  var searchMenagerie = function(server, endpoint, id) {
    var url = server + endpoint + id;

    $.ajax({
      url: url,
      contentType: 'application/json',
      type: 'GET',
      crossDomain: true,
      dataType: 'json',
    }).done(function(res) {
      if (res.success) {
        // TODO: don't use alerts for status updates
        ons.notification.alert('Transaction complete');
      } else {
        // TODO: don't use alerts for status updates
        ons.notification.alert(res.message);
      }
    }).fail(function(e) {
      // TODO: see if this message needs to be pretty-printed
      ons.notification.alert(JSON.stringify(e, null, 4));
      console.error('ERROR %s', e, JSON.stringify(e));
    });
  }

  return {submit: searchMenagerie};

})();
