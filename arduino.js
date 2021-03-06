/*
Class for Arduino communication.

On every action done it will wait with a promise until arduino respond back.
*/

var Q = require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog = require("./digestLog.js");

//Constructor method
function arduino(setup){
	this.setup = setup;
	this.port = new SerialPort(setup.port, { baudRate: setup.bauds, autoOpen: false } );//Sets the port and bitrate of the connection to the arduino
	//parser = this.port.pipe(new Readline({ delimiter: '\n' }));
	parser = this.port.pipe(new Readline({ delimiter: '*****\r' }));//creates the parser(interprets the raw data into the string we want) and the delimeter tells it where is the end of the data

	this.eventEmitter = new events.EventEmitter();
	var emitter = this.eventEmitter;

	//Create a listener each time arduino sends a string with \n as End of string
	parser.on('data', function(data){
   		emitter.emit('data',data);
	});
};

//Open port, and wait until arduino respond to connection
arduino.prototype.openPort = function () {
	var deferred = Q.defer();
	var setup_device = this.setup;
	var emitter = this.eventEmitter;
	this.port.on('open', function(){
		console.log(chalk.green("Opening serial on port "+setup_device.port+" at "+setup_device.bauds));
	});
	emitter.on('data',function(data){
		//console.log("EVENT EMITTER RECEIVED:",d);
		console.log("\t"+chalk.gray("-> ["+Date.now()+"] "+data.replace(/(\r\n|\n|\r)/gm,"")));
		emitter.removeAllListeners('data');
		deferred.resolve(data);
	});
	this.port.open();
	return deferred.promise;
}

//Write to arduino and wait untill response
arduino.prototype.writePort = function (str) {
	var deferred = Q.defer();
	let emitter = this.eventEmitter;
	emitter.on('data',function(data){
		//console.log("EVENT EMITTER RECEIVED:",d);
		console.log("\t"+chalk.gray("-> ["+Date.now()+"] " + digestLog.nfcLog(data.replace(/(\r\n|\n|\r)/gm,""))));	//digestLog.nfcRom(
		//console.log("\t"+chalk.gray("-> "+d.replace(/(\r\n|\n|\r)/gm,"")));	//digestLog.nfc(
		emitter.removeAllListeners('data');
		deferred.resolve(data);
	});
	this.port.write(str);
	return deferred.promise;
}

//Export module
module.exports = arduino;
