

var Q = require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog=require("./digestLog.js");

const portName = "COM6";


//The serial port parser
const port = new SerialPort(portName, {
  baudRate: 9600,
});

//The serial port parser
const parser = new Readline();
port.pipe(parser);

//Read the data from the port
parser.on("data", (data) => {console.log(data);});

//the connection takes some time to establish so you cant write just afeter opening the port, I should create a promise and when reciving the send data return it.
setTimeout(function(){port.write("connected");}, 3000);
console.log("written");
