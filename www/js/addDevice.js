var addDevice = (function() {

  var addDevice = function(server, endpoint, payload, fields){
    var url = server + endpoint;

    $.ajax({
      url: url,
      data: JSON.stringify(payload),
      contentType: 'application/json',
      type: 'POST',
      crossDomain: true,
      dataType: 'json',
    }).done(function(res) {
      console.log('AJAX response: ', JSON.stringify(res));
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

    console.log('POST', endpoint, JSON.stringify(payload));
  }

  return {submit: addDevice};

})();
