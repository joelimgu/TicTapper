var DDBB = require("./DDBB.js");
var Database = require("./DatabaseClass");
var setup = require("./setup.js");
console.log(DDBB.DEFAULT_TAGS_TABLE);

var database = new Database(setup.sql.database, "jobs", "tags");
database.connect(setup.sql).then((msg)=>{
//database.runQuery("USE koni;").then((msg) => {
// database.runQuery(DDBB.DEFAULT_JOBS_TABLE).then((msg) => {console.log(msg);});
// database.runQuery(DDBB.DEFAULT_TAGS_TABLE).then((msg) => {console.log(msg);});
database.runQuery("INSERT INTO jobs(\`name\`,ref,pre_url,uid_len,qty,qtydone,rom,\`status\`,modified_at) VALUES(\'TS0000\',\'TS0000\',\'https://tictap.me/track/',10,10,0,0,'start'," + Date.now() +");");
});
