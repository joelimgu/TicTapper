

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
    await this._testConnection();

    deferred.resolve();
    return deferred.promise;
  };

  async _openListeners(){
    this.port.on('open', (msg) => {console.log(chalk.blue("Connecting to the Arduino"));});
    this.parser.on("data", (msg = "") => {console.log("Arduino: " + msg);
                                console.log("msg -> " + msg);
                                if (msg){
                                  try{
                                    this.data = JSON.parse(msg);
                                    console.log("JSON -> " + this.data.command);
                                  }catch(err){
                                    console.log("error recieving arduino data" + err);
                                  }
                                }
                                });
    this.port.on('error', (err) => {console.log(chalk.red(err));})
  }

  async _testConnection(){
    let deferred = Q.defer();
    let connected = false;
    let i = 0;
    do {
      await delay(1000);
      await this.sendData("?")
      try{
        if (this.data.command.indexOf("?") >= 0){
          connected = true;
          deferred.resolve(i)
        };
      }catch{
        
      };
      if (i > 10){
      throw "Can't connect to the Arduino"
      i++;
      }
    } while (!connected);
    console.log(chalk.green('Connected to the arduino in '+ i + ' attemps'));
    return deferred.promise;
  };

  sendData(msg){
    this.port.write(msg);
    console.log(msg);
  }

};

// var arduino = new Arduino();
// arduino.connect(portName, 9600, true).then((msg) => {console.log(chalk.green.bold("Arduino Connected"));})



module.exports = Arduino;//exports the
