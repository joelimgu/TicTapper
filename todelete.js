var DDBB = require("./DDBB.js");
var Database = require("./DatabaseClass");
var setup = require("./setup.js");
console.log(DDBB.DEFAULT_QUERY);

var database = new Database(setup.sql.database, "jobs", "tags");
database.connect(setup.sql);
//database.runQuery("USE koni;").then((msg) => {
database.runQuery(DDBB.DEFAULT_QUERY).then((msg) => {console.log(msg);});
