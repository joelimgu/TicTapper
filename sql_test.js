
var Q=require("q");
var mysql = require('mysql');
var setup = require('./setup.js');
var apiSql = require("./sql.js");
var aaaaaaa = require('./sql')


//aaaaa = apiSql.connectSql().then((result)=>{console.log(result.value)})
//                           .catch((err)=>{console.log(err)});


var con = mysql.createConnection(setup.sql);

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

  let sql ="SELECT * FROM koni.jobs"
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result[0].name);
  });

  sql ="SELECT * FROM koni.jobs WHERE id = 1"
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result[0].name);
  });
