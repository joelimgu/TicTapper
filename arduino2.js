

var Q = require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog = require("./digestLog.js");
var setup = require("./setup.js");
const delay = require('delay');

const portName = "COM6";


var port
var parser
var data = "";
var conection


async function connect(portName, baudRate = 9600, autoOpen = true){
  let deferred = Q.defer();

  port = new SerialPort(portName, {
    autoOpen: autoOpen,
    baudRate: baudRate,
  });

  parser = new Readline({delimeter: '\r\n' });
  port.pipe(parser);

  await testConnection();

  deferred.resolve();
  return deferred.promise;
};


async function testConnection(){
	let deferred = Q.defer();
  let connected = false;
  let i = 0;
  do {
    await delay(1000);
    await sendData("?")
    if (data.indexOf("?") >= 0){
      connected = true;
      deferred.resolve(i)
    };
    if (i > 10){
      throw "Can't connect to the Arduino"
    };
    i++;
  } while (!connected);
  console.log(chalk.green('Connected to the arduino in '+ i + ' attemps'));
  return deferred.promise;
};

function sendData(msg){
  port.write(msg + '\r');
}



connect(portName, 9600, true).then((msg) => {console.log(chalk.green.bold("Arduino Connected"));})


port.on('open', (msg) => {console.log(chalk.blue("Connecting to the Arduino"));});
parser.on("data", (msg) => {console.log("Arduino: " + msg);
                            data = msg;
                            });
port.on('error', (err) => {console.log(chalk.red(err));})


function getData(){
  return data;
}

module.exports = {sendData , connect, getData}//exports the
