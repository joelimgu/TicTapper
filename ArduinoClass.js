

var Q = require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog = require("./digestLog.js");
var setup = require("./setup.js");
const delay = require('delay');

const portName = "COM6";


class Arduino {
  async connect(port, baudRate = 9600, autoOpen = true){ //connects to the arduino adn resolves when the conection is done
    let deferred = Q.defer();
    this.portName = port;
    this.baudRate = baudRate;

    this.port =  new SerialPort(port, { baudRate: baudRate, autoOpen: autoOpen } );//Sets the port and bitrate of the connection to the arduino

    this.parser =  this.port.pipe(new Readline({ delimiter: '\r\n' }));//creates the parser( the interpreter of the arduino msg as a one single string not seperate things)
    await this._openListeners(); // creates all the event listeners for the data, open and error events of the arduino

    deferred.resolve();
    return deferred.promise;

  }

  _openListeners(){
    let deferred = Q.defer();

    this.port.on('open', function(){ //informs the user if the port is beeing opened
  		console.log(chalk.green("Opening serial on port "+this.port+" at "+this.baudRate));
  	});

    this.port.on('error', function(err){ // handles the errors of the serialport connection
      console.log(chalk.red.bold("An error has occured while connecting to the arduino: " + err));
    });

    this.parser.once('data', function(msg){
      deferred.resolve(this.data);
    })

    this.parser.on('data',function(msg){ // recieves the data from the arduino and tries to save it as  a dictionary
      console.log(chalk.gray("-> " + msg));
      try{
        var json = JSON.parse(msg); //transforms the msg to a dictionary for easier treatement
        this.data = json;
      }catch(err){
        console.log("Arduino didns send a JSON, insted send : '" + msg +"' ");
        this.data = "";
      };
    });

    return deferred.promise;
  }

  write(msg){ //writes a msg to the arduino and waits for its response wo assure the communications is completed succsesfully;
    let deferred = Q.defer();
    this.port.write(msg);
    this.parser.once('data',function(){
      if (this.data.command == msg) deferred.resolve(this.data);
      else throw "The recieved data from the arduino dosen't correspond with the message send";
    });
    return deferred.promise;
  };

};

// var a = new Arduino();
// a.connect(portName, 9600).then((msg) => {
//   console.log("connected");
//   a.write("que tal").then((a) => {console.log("msg send");})
// });


module.exports = Arduino;//exports the class
