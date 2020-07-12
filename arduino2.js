

var Q=require("q");
var events = require("events");
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const chalk = require('chalk');
var digestLog=require("./digestLog.js");

const portName = "COM6";


var myPort = new SerialPort(portName,{
  baudRate:9600,
  autoOpen: false,
  parser:SerialPort.parsers.readline("\r\n")
})

myPort.on('open', onOpen);
myPort.on('data',onData);

function onOpen(){
  console.log('open connection with arduino');
};

function onData(data){
  console.log("on Data" + data);
};
