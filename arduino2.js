

var Q = require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog = require("./digestLog.js");
var setup = require("./setup.js");
const delay = require('delay');

const portName = "COM6";


class Arduino{
  constructor(){
    this.port
    this.parser
    this.data = "";//the arduino will returs a JSON and will be stored here
    this.eventEmitter = new events.EventEmitter();
  }

  async connect(portName, baudRate = 9600, autoOpen = true){
    let deferred = Q.defer();

    this.port = new SerialPort(portName, {
      autoOpen: autoOpen,
      baudRate: baudRate,
    });

    this.parser = new Readline({delimeter: '\r\n' });
    this.port.pipe(this.parser);
    this._openListeners();
    //await this._testConnection();

    deferred.resolve();
    return deferred.promise;
  };

  async _openListeners(){
    this.eventEmitter.on('done', (msg) => {console.log("done");})
    this.port.on('open', (msg) => {console.log(chalk.blue("Connecting to the Arduino"));});
    this.parser.on("data", (msg = "") => {console.log("Arduino: " + msg);
                                this.eventEmitter.emit('done', msg);
                                });
    this.port.on('error', (err) => {console.log(chalk.red(err));})
  }
}

// var arduino = new Arduino();
// arduino.connect(portName, 9600, true).then((msg) => {console.log(chalk.green.bold("Arduino Connected"));})



module.exports = Arduino;//exports the
