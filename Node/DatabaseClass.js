var Q=require("q");                         //promise handeler
var mysql = require('mysql');
var setup=require('./setup');               //Has the conection info for the database and the arduino
const chalk = require('chalk');             //color terminal



class Database {                             //class to create a db to CRUD
  constructor(db, jobsTable, tagsTable){
    this.db = db; //the db name
    this.jobsTable = jobsTable;
    this.tagsTable = tagsTable;
  };

  runQuery(query) {                         //runs a SQL query as a promise
    let deferred = Q.defer();
    if (!this.connectedDB){throw "The db is not connected"}
    if (!this.db){throw "No db defined, use obj.db = \`your db\` to define it"}
    this.connectedDB.query(query, function (err, result){
      if (err) throw err;                 //passes the error if thers one
      deferred.resolve(result);           //if not resolve the promise and pass the querry result [{id:1, name:"hahah"...},{...},...]
    });
    return deferred.promise;                //return the promise
  };
  //example of use: runQuery("SELECT * FROM koni.jobs WHERE id = 7").then((msg) => {console.log(msg);})        //runs the querry using the run querry function in the same class witch is a promise also
  //                    .catch((err) => {throw(err)})


  connect(info) {                                   // connects to a db given the db info ({ host : 'localhost',   user : 'tictap',  password : '1234',  database : 'KONI'})
    let deferred = Q.defer();
    this.connectedDB = mysql.createConnection(info);  //creates the connection using the info
    this.connectedDB.connect(function(err) {              //actualy connects to the db
      if (err) { throw err;};
      console.log(chalk.green("Connected to " + info.database));              //info to the "user"
      deferred.resolve("Connected");                       //resolves the promise if thers no errors
    });
    return deferred.promise;
  };
//example of use: dtbs.connect({ host : 'localhost',   user : 'tictap',  password : '1234',  database : 'KONI'}).catch(err => {console.log(err);});


  deleteObj(obj,table){                              //gets an array of lines to delete and the table where to delete them and deletes them
    let deferred = Q.defer();
    if (obj.length == 0){                                  //looks if the array is empty
      throw "An empty array was passed ";
    }else {                                                 // If its not delets the items in it
      for(let i=0;i < obj.length;i++){
        let query = "DELETE FROM koni."+table+" WHERE id= "+obj[i].id; //generates de SQL querry to delete the items one by one taking the primary key(id) to identify them
        this.runQuery(query).then((msg) => {deferred.resolve})        //runs the querry using the run querry function in the same class witch is a promise also
                            .catch((err) => {throw(err)})
        console.log(chalk.yellow("Deleted object in table" + table + "whth id : " + i)); // information to the "user"
      };
    };
    return deferred.promise; // returns the promise
  };
//example os use: dtbs.deleteObj([{id: 5, name: "Joel",...},...],"jobs").then(console.log("done");).catch((err) => {console.log(err);})


//!!!!!!This function has no been tested for now!!!!!!!!!!!
  updateObj(table, column, newValue, condition){      // given the table column to update the value to store and what lines should be updates it updates the table
    let deferred = Q.defer();
    let query =" UPDATE "+ table + " SET "+ column +"=" + newValue + " WHERE "+ condition;
    this.runQuery(query).then((msg) => {deferred.resolve})  //runs the querry using the run querry function in the same class witch is a promise also
                        .catch((err) => {throw(err)});      //passes the error
    console.log(chalk.green("from table" + table +" updated column" + column + " to : " + newValue)); // gives the info to the "user"
    return deferred.promise;
  };


  getActiveJob() {                              //finds an active job thats in the jobs table
    let deferred = Q.defer()
    if (typeof this.jobsTable == 'undefined'){// checks if thers a jobs table, if not throws an error
      throw "The jobs table hasn't been asigned to this object, please add what table are the jobs stored"
    };
    let query = "SELECT * FROM " + this.jobsTable + " WHERE status='start' ORDER BY id DESC LIMIT 1" //queries to find the active jobs and returns them with desc order by id
    this.runQuery(query).then((res) => {deferred.resolve(res)})    //handles the promise
                   .catch((err => {throw(err);}));
    return deferred.promise;
  };


  updateJobQty(job){ //updated the passed job. Used to updated the quantity done.
    let deferred = Q.defer()
    if (typeof this.jobsTable == 'undefined'){// checks if thers a jobs table, if not throws an error
      throw "The jobs table hasn't been asigned to this object, please add what table are the jobs stored"
    };
    let query = "UPDATE jobs SET qtydone='"+job.qtydone+"', status='"+job.status+"', modified_at='"+Date.now()+"' WHERE id='"+job.id+"'";
    this.runQuery(query).then((res) => {deferred.resolve(res)})
                        .catch((err) => {throw(err)});
    return deferred.promise;
  };



  insertTag(tag){ //inserts a tag into the tags table
    var deferred = Q.defer();
    if (typeof this.tagsTable == 'undefined'){ //chach if thers a tags table
      throw "no tags table has been defined"
    };
    //generate the querry to add the tag
    var query="INSERT INTO tags SET url='"+tag.url+
              "',job_id='"+tag.job_id+
              "',uid='"+tag.uid+
              "', timespent='"+tag.timespent+
              "', timeToDetect='"+tag.timeToDetect+
              "', timeToIdentify='"+tag.timeToIdentify+
              "', timeToRead='"+tag.timeToRead+
              "', timeToWrite='"+tag.timeToWrite+
              "', datum='"+tag.datum+
              "', stamp='"+Date.now()+"'";
    this.runQuery(query).then((res) => {deferred.resolve(res)})
                        .catch((err) => {throw(err)});
    return deferred.promise;
  };


  insertJob(job){
    let deferred = Q.defer();
    if (!job) throw "the job to be inserted is undefined"
    const query = "INSERT INTO jobs(`name`,ref,pre_url,uid_len,qty,qtydone,rom,`status`,modified_at)"
      + "VALUES('"
      + job.name + "',"
      + "'" + job.ref + "',"
      + "'" + job.pre_url + "',"
      + 0 +","
      + job.qty + ","
      + job.qtyDone + ","
      + job.rom + ","
      + "'" + job.status + "'" + ","
      + Date.now() + ")";

    this.runQuery(query).then((res) => {deferred.resolve(res); console.log("Created Job: " + job.name);})
                        .catch((err) => {throw(err)});
    return deferred.promise;
  }

  updateDB(newDB){
    let deferred = Q.defer();
    const query= "USE " + newDB + ";"
    this.runQuery(query).then((res) => {
      console.log(chalk.green("DB updated to: " + newDB));
      this.db = newDB;
      deferred.resolve(res);})
                        .catch((err) => {throw(err)});
    return deferred.promise;
  }

  getLastEditedJob(){
    let deferred = Q.defer();
    const query= "SELECT * , MAX(modified_at) FROM jobs;";
    this.runQuery(query).then((res) => {
      deferred.resolve(res);})
                        .catch((err) => {throw(err)});
    return deferred.promise;
  }
};

//exports the class to be used in other parts of the program
module.exports = Database;
