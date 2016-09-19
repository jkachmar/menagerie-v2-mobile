var resultDiv, resultZbar, socket, _device, _location, _assetTag, _form;

var	SERVER_URL = '';
var WEB_APP_TOKEN = '';

var isPhoneGap = ! /^http/.test(document.location.protocol);

//HACK!Prevent scrolling out of view
document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);
window.cordova = true;

var validations = {
	location: /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/,
	device: /^([0-9A-Fa-f]{2}[:-]?){5}([0-9A-Fa-f]{2})$/,
	assetTag: /^[0-9]{6}$/
};

var addDeviceHandler = function() {
  var deviceId = document.getElementById('add-device-id').value;
  var deviceLocation = document.getElementById('add-device-location').value;
  var deviceMac = document.getElementById('add-device-mac').value;

	var payload = {
		alias: deviceMac,
		location: deviceLocation,
		assetTag: deviceId
	};

  if (SERVER_URL) {
    console.log(SERVER_URL);

  } else {
    ons.notification.alert('No Server URL specified');
  }
};

// Handle token auth and server URL
var authHandler = function() {
  SERVER_URL = document.getElementById('config-server-field').value;
  WEB_APP_TOKEN = document.getElementById('config-server-field').value;
  console.log('URL: ' + SERVER_URL + ' TOKEN: ' + WEB_APP_TOKEN);

  if (SERVER_URL && WEB_APP_TOKEN) {
    document.getElementById('add-device-submit-btn').innerHTML = 'Connecting...';
    notifyReading('', payload);

    // createSocket(SERVER_URL);
  } else {
    ons.notification.alert('Incomplete Authentication Information');
  }
};

function createSocket(url){

	if(socket && socket.io.uri === url){
		if(socket.connected) return console.log('Socket connected');
	}

	if(socket){
		socket.close();
		socket.removeAllListeners();
		socket.doConnect = true;
		console.log('Socket reset');
	}

	socket = io(url, {
		transports:[
			'polling',
			'websocket',
			'htmlfile',
			'xhr-polling',
			'jsonp-polling'
		]
	});

	socket.on('connect', function () {
		console.log('Connected');
    document.getElementById('add-device-submit-btn').setAttribute('disabled', '');
    document.getElementById('add-device-submit-btn').innerHTML = 'Submit';
	});

	socket.on('error', function(e){
    document.getElementById('add-device-submit-btn').innerHTML = 'Error connecting!';
	});

	socket.on('/thing/barcode-scann', function(payload){
		console.log('UPDATED: ', JSON.stringify(payload));
		resultDiv.innerHTML = payload.success ? '<p>All GOOD</p>' : '<p>Error :(</p>';
	});

	if(socket.doConnect){
		socket.connect();
		console.log('Socket connecting');
	}

	window.socket = socket;
}

var startScan = function() {
	// cordova.plugins.barcodeScanner.scan(
	// 	function (result) {
	// 		var s = "Result: " + result.text + "<br/>" +
	// 		"Format: " + result.format + "<br/>" +
	// 		"Cancelled: " + result.cancelled;
	// 		result = sanitizePayload(result);
	// 		handleReading(result);
	// 	},
	// 	function (error) {
	// 		alert("Scanning failed: " + error);
	// 	}
	// );
};

function _clear(e){
	e && e.preventDefault();

	_device.val('');
	_location.val('');
	_assetTag.val('');

	return false;
}

function handleReading(result){

	var reg, valid = false;
	Object.keys(validations).map(function(key){
		reg = validations[key];
		if(!reg.test(result.text)) return;
		$('#'+key).val(result.text);
		valid = true;
	});

	if(!valid) {
    ons.notification.alert('Invalid barcode input');
  }
}

function notifyReading(endpoint, payload){
	console.log('=> NOTIFY READING', endpoint, JSON.stringify(payload));

	socket.emit('/thing/socketes', payload);

	resultDiv.innerHTML = endpoint;

	$.ajax({
		url: endpoint,
		data: payload,
		type: "POST",
		crossDomain: true,
		dataType: "json",
		beforeSend : setAuthorizationToken
	}).done(function(res){
		console.log('AJAX response: ', JSON.stringify(res));
		if(res.success) resultDiv.innerHTML = 'Transaction complete';
		else resultDiv.innerHTML = res.message;
	}).fail(function(e){
		console.error('ERROR %s', e, JSON.stringify(e));
		resultDiv.innerHTML = '<h4>Error</h4><br/><code>' + JSON.stringify(e, null, 4) + '</code>';
	});

	console.log('POST', endpoint, JSON.stringify(payload));
}

function getToken(){
	console.log('WEB APP TOKEN', WEB_APP_TOKEN);
	return "Bearer " + WEB_APP_TOKEN;
}
function setAuthorizationToken(xhr){
	xhr.setRequestHeader("Authorization", getToken());
}

function sanitizePayload(result){
	//TODO: for realz
	result.text = result.text.replace('/find/device/', '');
	result.text = result.text.replace('/find/location/', '');
	// result.text = (result.text || '').replace(/\W/g, '');
	result.barcode = result.text;
	return result;
}

function oauthsetup(){
	var authUrl = 'http://things.weworkers.io/login';
	var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');
	$(authWindow).on('loadstop', function(e){
		console.log('LOADSTOP');
		console.log('e', JSON.stringify(e, null, 4));
	});

	$(authWindow).on('loaderror', function(e){
		console.log('LOADERROR');
		console.log('e', JSON.stringify(e, null, 4));
	});

	$(authWindow).on('exit', function(e){
		console.log('EXIT');
		console.log('e', JSON.stringify(e, null, 4));
	});

	$(authWindow).on('loadstart', function(e){
		var url = e.originalEvent.url;
		var code = /\?code=(.+)$/.exec(url);
		var error = /\?error=(.+)$/.exec(url);

		if (code || error) {
			//Always close the browser when match is found
			authWindow.close();
			console.log('Close authwindow', code ? code : error);
		}

		console.log(authWindow.document.title);
		if (code) {
			//Exchange the authorization code for an access token
			$.post('https://accounts.google.com/o/oauth2/token', {
				code: code[1],
				client_id: options.client_id,
				client_secret: options.client_secret,
				redirect_uri: options.redirect_uri,
				grant_type: 'authorization_code'
			}).done(function(data) {
				deferred.resolve(data);
			}).fail(function(response) {
				deferred.reject(response.responseJSON);
			});
		} else if (error) {
			//The user denied access to the app
			deferred.reject({
				error: error[1]
			});
		}
	});
}
