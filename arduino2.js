

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
  async connect(port, baudRate = 9600, autoOpen = true){ //connects to the arduino adn resolves when the conection is done
    let deferred = Q.defer();
    this.portName = port;
    this.baudRate = baudRate;

    this.port =  new SerialPort(port, { baudRate: baudRate, autoOpen: autoOpen } );//Sets the port and bitrate of the connection to the arduino

    this.parser =  this.port.pipe(new Readline({ delimiter: '\r\n' }));//creates the parser( the interpreter of the arduino msg as a one single string not seperate things)
    await this._openListeners();

    deferred.resolve();
    return deferred.promise;

  }

  _openListeners(time = 5000){
    let deferred = Q.defer();
    let isDone = false;
    setTimeout(this._conectionTimeout, time, isDone, time);


    this.port.on('open', function(){
  		console.log(chalk.green("Opening serial on port "+this.port+" at "+this.baudRate));
  	});

    this.port.once('error', function(err){
      console.log(chalk.red.bold("An error has occured while connecting to the arduino: " + err));
    });


    this.parser.on('data',function(data){
      console.log(chalk.gray("-> " + data));
      deferred.resolve(data);
      isDone = true;
      console.log("dta");
    });

    return deferred.promise;
  }

  _conectionTimeout(isDone, time = "NA") {
    let deferred = Q.defer();
    console.log("timeoutut");
    console.log(isDone);
    if (!isDone) throw "Conextion timeout t = " + time/1000 + "s when connecting to the arduino";
    else deferred.resolve();
    return deferred.pormise;
  };
};

var a = new Arduino();
a.connect(portName, 9600).then((msg) => {
  console.log("connected");
})



module.exports = Arduino;//exports the
