var Q=require("q");
var apiDevice = require("./apiDevice.js");
const chalk = require('chalk');
var setup=require('./setup');
var apiSql=require("./sql.js");
var _=require('lodash');
const readlineSync = require('readline-sync');
var replaceall = require('replaceall');
var apiQRGun = require("./apiQRGun.js");
var Database = require("./DatabaseClass");


var database

//++++++++++++++++++++++++++INIT++++++++++++++++++++++++//
async function initialize(){
  let deferred = Q.defer();
  database = await new Database(setup.sql.database, jobs, tags);

  await Promse.all([apiDevice.connectDevices(), database.connect(setup.sql)]).then((msg) =>{
    console.log(chalk.green("->" + msg[0]));
    console.log(chalk.green("-> Database " + msg[1]));
    deferred.resolve();
  }).catch((err) => {
      throw err;
  });
  return deferred.promise;
};


var apiTictapper={
	qrGun: new apiQRGun()
};

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function insertTagToDB(job, start, nfcWr, url){
  let deferred = Q.defer();

	job.qtydone++;
	var speed = (Date.now()-start);
	var left = job.qty - job.qtydone;
	var auxnfcWr = nfcWr;
	var auxNfc = nfcWr.split("**");

	if (job.qtydone == job.qty){
		job.status = "stop";
	};
			//22aaee3344ff**RO**122**211**432**223
			//uid -> id xip NFC ** (readonly(RO),readOk(R),readError(RE),qwriteError(WE)) ** .....
															//en relaitat es write and rom pero es RO....
	var tagObj = {
		job_id: actualjob.id,
		url: url,
		uid: auxNfc[0],
		status: "Success",
		timespent: speed,
		timeToDetect: auxNfc[2],
		timeToIdentify: auxNfc[3],
		timeToRead: auxNfc[4],
		timeToWrite: auxNfc[5],
		datum: auxnfcWr,
		created_at: Date.now()
	};

  await Promises.all([database.insertTag(tagObj), database.putActiveJob(job)]).then((msg) => {deferred.resolve(job)}).catch((err) => {throw err});

  console.log("\t" + chalk.green("-> Success. Speed: " + speed + " ms. Finishing job in " + ((speed*left)/1000) + " seconds."));

	if (job.status == "stop"){ //infos the user that the job has been finished ( should add a log aftes the while to inform the end)
		console.log(chalk.green("Job " + job.name + " Finished."));
	};
  return deferred.promise;
};


apiTictapper.mainLoop = async function(){
	var deferred=Q.defer();
	//console.log(chalk.green("\nAwaiting serial..."));
	while(true){	//En principi no ha de sortir mai d'aquí

		var job = await apiSql.getActiveJob();	//1- Check Job
		if (!_.isEmpty(job)){                   //if thers a job:
			console.log(chalk.green("Found active job:"+job.ref+" "+job.name+" "+job.qtydone+"/"+job.qty));

      var rom = "D"; //Don not rom stickers for this job
			if (job.rom == 1)		rom = "C"; //Rom stickers for this job
			var r = await apiDevice.nfcSetRom(rom); //useless variable, only for the await
			//Set first sticker on position:
			//var r=await apiDevice.nfcWrite("S");
			console.log(chalk.green("First sticker in pre-position"));

			while (job.qtydone < job.qty){
				var actualjob = await apiSql.getActiveJob();// should be able to delete but its here for now
				var start = Date.now();   //stores the start time to know how much it took later
				console.log(chalk.cyan("\tProcessing sticker "+(actualjob.qtydone+1)+"/"+actualjob.qty)); //infos the user of the progress made

				var url = await apiTictapper.qrGun.getUrl();  //gets the url

				var nfcWr = await apiDevice.nfcWrite(url);  //writes the url

				if ((nfcWr.indexOf("error")<0)&&(nfcWr.indexOf("Error"))<0){
          try {
            await insertTag(job, start, nfcWr, url);  //stores the tag in the db
          }catch(err){
              console.log(chalk.red("An error has occured : " + err));
          };

				}else{	//An error ocurred while writing NFC
					console.log("\t"+chalk.red("-> Error: NFC. "+digestLog.nfcLog(nfcWr)));
					//Comprovar si al log hi ha la url que anava a guardar, si coincideixen vol dir que la etiqueta ja estava gravada correctament i tancada i per tant continuar, else atura i no la comptabilitzis...

					//tags should be an array of teh written tags and i an i++ variable to keep track of the tag we are doing and tst only that the urs exists in it
					if (nfcWr.indexOf(tags[i].url)>=0){ //La url està ben desada
            try {
              await insertTag(job, start, nfcWr, url);
            }catch(err){
                console.log(chalk.red("An error has occured : " + err)); //stores the tag done in db
            };
					}else{
						//apiGpio.buzzer();
						var ans = readlineSync.question('\t -> Solve the issue and press enter to continue');
					}
				}
			}
		}
		//2- While job active:
		//2.1- tell arduino to put one sticker in position
		//2.2- read URL from QR
		//2.3- tell arduino to write & Rom the decoded url
		//2.4- save data to DDBB
		//2.5- Goto 2.
	}
	return deferred.promise;
}


//Export module
module.exports = apiTictapper;
