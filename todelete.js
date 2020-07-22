var DDBB = require("./DDBB.js");
var Database = require("./DatabaseClass");
var setup = require("./setup.js");
var Q = require("q");
const delay = require('delay');
const chalk = require('chalk');

var Arduino = require("./arduino2.js")

//console.log(DDBB.DEFAULT_TAGS_TABLE);

// var database = new Database(setup.sql.database, "jobs", "tags");
// database.connect(setup.sql).then((msg)=>{
// //database.runQuery("USE koni;").then((msg) => {
//  // database.runQuery(DDBB.DEFAULT_JOBS_TABLE).then((msg) => {console.log(msg);});
//  // database.runQuery(DDBB.DEFAULT_TAGS_TABLE).then((msg) => {console.log(msg);});
//  // database.runQuery("INSERT INTO jobs(\`name\`,ref,pre_url,uid_len,qty,qtydone,rom,\`status\`,modified_at) VALUES(\'TS0000\',\'TS0000\',\'https://tictap.me/track/',10,10,0,0,'start'," + Date.now() +");");
//
// // a();
//
//  });

//
// async function a(){
//
//   var job = await database.getActiveJob();
//   job = job[0]
//   console.log(job);
// }
//
//
// async function a() {
//   let deferred = Q.defer();
//   deferred.reject;
//   deferred.promise = await setTimeout(b, 3000, deferred);
//   await delay(3000);
//   return deferred.promise;
// }
//
// async function b(deferred){
//   console.log("b");
//   deferred.resolve;
//   return deferred.promise;
// }
//
// a().then((msg) => {console.log("c");})
// arduino.connect("COM6", 9600, true).then((msg) => {
//   console.log("data" + arduino.getData());
// })


var arduino = new Arduino();
arduino.connect("COM6", 9600, true).then((msg) => {console.log(chalk.green.bold("Arduino Connected"));})
setTimeout(function(){arduino.sendData("Hola")},3000);

var a = ` {"command":"Hola","tagID":"","romIt":0,"operationType":"","timeToDetect":0,"timeToIdentify":0,"timeToRead":0,"timeToWrite":0}\r\n`
b = JSON.parse(a);
console.log(a);
