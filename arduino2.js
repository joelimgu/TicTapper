

var Q=require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog=require("./digestLog.js");

const portName = "COM6";


//https://www.youtube.com/watch?v=__FSpGHx9Ow
// void setup() {
//   Serial.begin(9600); // open the serial port at 9600 bps:
//
// };
//
//
// void loop(){
//   if (Serial.available() > 0){
//     Serial.println("I recieved: " + Serial.readString());
//   };
//   delay(1000);
// };

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
