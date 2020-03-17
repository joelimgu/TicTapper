/*
Api module to work with the database
*/

var Q=require("q");
var mysql = require('mysql');
var setup=require('./setup');
const chalk = require('chalk');

var sql={
};

sql.connectSql=function () {
	var deferred=Q.defer();
	sql.db=mysql.createConnection(setup.sql);
	sql.db.connect((err) => {
		if (err) {
			throw err;		
		}
		console.log(chalk.green('Connected to database '+setup.sql.database));	
		deferred.resolve("connected");	
	});
	return deferred.promise;	
}


sql.getActiveJob=function () {
	var deferred=Q.defer();
	if (sql.db){
		var query="SELECT * FROM jobs WHERE status='start' ORDER BY id DESC LIMIT 1";
		sql.db.query(query, function(err, results){
			if (err)	deferred.reject(err);
			else 	deferred.resolve(results[0]);
		})
	}else{
		deferred.reject("No database connection available");	
	}
	return deferred.promise;
}
	
sql.putActiveJob=function (job) {
	var deferred=Q.defer();
	if (sql.db){
		var query="UPDATE jobs SET qtydone='"+job.qtydone+"', status='"+job.status+"', modified_at='"+Date.now()+"' WHERE id='"+job.id+"'";
		sql.db.query(query, function(err, results){
			if (err)	deferred.reject(err);
			else 	deferred.resolve(results);
		})
	}else{
		deferred.reject("No database connection available");	
	}
	return deferred.promise;
}

sql.insertTag=function (tag) {
	var deferred=Q.defer();
	if (sql.db){
		var query="INSERT INTO tags SET url='"+tag.url+"',job_id='"+tag.job_id+"',uid='"+tag.uid+"', timespent='"+tag.timespent+"', timeToDetect='"+tag.timeToDetect+"', timeToIdentify='"+tag.timeToIdentify+"', timeToRead='"+tag.timeToRead+"', timeToWrite='"+tag.timeToWrite+"', datum='"+tag.datum+"', stamp='"+Date.now()+"'";
		sql.db.query(query, function(err, results){
			if (err)	deferred.reject(err);
			else 	deferred.resolve(results);
		})
	}else{
		deferred.reject("No database connection available");	
	}
	return deferred.promise;
}

//Export module
module.exports=sql;