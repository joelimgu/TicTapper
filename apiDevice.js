/*
API to deal with Arduinos, all methods are promises
*/

var Q = require("q");
var arduino = require("./arduino.js");
var setup = require('./setup');


var apiDevice = {
	nfc: new arduino(setup.antenna_a)
	//feed: new arduino(setup.arduino_feed)
};

//method to open connection to serial ports
apiDevice.connectDevices = function(){
	var deferred = Q.defer();
	var response = [];
	promises = [apiDevice.nfc.openPort()];
	Q.allSettled(promises)
	.then(function (results) {
	    results.forEach(function (result) {
	    	response.push(result);
	    });
	    deferred.resolve(response);
	});
	return deferred.promise;
}

/* NFC device */
//method to setup nfc device to rom or not the registered stickers
apiDevice.nfcSetRom = function (val) {	//val=C ROM, val=D No ROM
	var deferred = Q.defer();
	apiDevice.nfc.writePort(val).then(function(result){
	deferred.resolve(result);
	});
	return deferred.promise;
}

//method to write a url to sticker
apiDevice.nfcWrite = function (cmd) {
	var deferred = Q.defer();
	//console.log("Command sent to Arduino: "+cmd);
	apiDevice.nfc.writePort(cmd).then(function(result){
		deferred.resolve(result);
	});
	return deferred.promise;
}

//Export module
module.exports = apiDevice;
