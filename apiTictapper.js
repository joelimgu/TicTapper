var Q=require("q");
var apiDevice = require("./apiDevice.js");
const chalk = require('chalk');
var setup=require('./setup.js');
var apiSql=require("./sql.js");
var _=require('lodash');
const readlineSync = require('readline-sync');
var replaceall = require('replaceall');
var apiQRGun = require("./apiQRGun.js");

var apiTictapper={
	qrGun: new apiQRGun()
};


apiTictapper.initialize=function(){
	var deferred=Q.defer();

	//Obrir els ports de cada device i connectar a la BBDD
	promises=[apiDevice.connectDevices(),apiSql.connectSql()];
	Q.allSettled(promises).then(function (results) {
		results.forEach(function (result) {
	        if (result.state === "fulfilled") {
	            console.log("\t"+chalk.yellow("-> "+result.value));
	        } else {
	        		console.log("\t"+chalk.red("-> "+result.reason));
	        }
	    });
		console.log(chalk.green.bold("System is ready to rock!"));
	  deferred.resolve("ROCK IT");
	});
	return deferred.promise;
};

apiTictapper.mainLoop=async function(){
	var deferred = Q.defer();
	//console.log(chalk.green("\nAwaiting serial..."));
	while(true){	//En principi no ha de sortir mai d'aquí

		var job = await apiSql.getActiveJob();	//get the jobs with the status start in them
		if (!_.isEmpty(job)){ 								//chaeck if a job has been found
			console.log(chalk.green("Found active job:"+job.ref+" "+job.name+" "+job.qtydone+"/"+job.qty)); //info the "user" about the job that has been found
			console.log(chalk.green("Initialize TicTAP-KONI"));
			var rom = "D"; //Don not rom stickers for this job
			if (job.rom==1)	rom="C"; //Rom stickers for this job
			var r = await apiDevice.nfcSetRom(rom);
			//Set first sticker on position:
			//var r=await apiDevice.nfcWrite("S");
			console.log(chalk.green("First sticker in pre-position"));

			while (job.qtydone<job.qty){ 									//while there's stickers to be done loop
				var actualjob = await apiSql.getActiveJob();	//
				var start=Date.now();												//records the starting time of the setup for the sticker
				console.log(chalk.cyan("\tProcessing sticker "+(actualjob.qtydone+1)+"/"+actualjob.qty)); // ifos the "user" about the sticker it's processing

				var url=await apiTictapper.qrGun.getUrl(); //waits for the QR gun to send the URL

				var nfcWr=await apiDevice.nfcWrite(url);


				if ((nfcWr.indexOf("error")<0)&&(nfcWr.indexOf("Error"))<0){
					actualjob.qtydone++;
					job.qtydone = actualjob.qtydone;
					var speed = (Date.now()-start);
					var left = actualjob.qty-actualjob.qtydone;
					var auxnfcWr = nfcWr;
					var auxNfc = nfcWr.split("**");

					if (actualjob.qtydone == actualjob.qty){ //sets the status to stop so the program dosen't continue as all the tags from the jobs are done
						actualjob.status = "stop";
					}

							//22aaee3344ff**RO**122**211**432**223
					var tagObj={			//creates the tagObj to be inseted to the tags db with all the info of the written tag
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
					//Update tag to ddbb
					var pt=await apiSql.insertTag(tagObj);

					//Update qtydone of job in ddbb
					var pj=await apiSql.putActiveJob(actualjob);
					console.log("\t"+chalk.green("-> Success. Speed: "+speed+" ms. Finishing job in "+((speed*left)/1000)+" seconds."));

					if (actualjob.status=="stop"){
						console.log(chalk.green("Job "+actualjob.name+" Finished."));
					};
				}else{	//An error ocurred while writing NFC
					console.log("\t"+chalk.red("-> Error: NFC. "+digestLog.nfcLog(nfcWr)));
					//Comprovar si al log hi ha la url que anava a guardar, si coincideixen vol dir que la etiqueta ja estava gravada correctament i tancada i per tant continuar, else atura i no la comptabilitzis...
					if (nfcWr.indexOf(tags[i].url)>=0){ //La url està ben desada
						actualjob.qtydone++;
						job.qtydone=actualjob.qtydone;
						var speed=(Date.now()-start);
						var left=actualjob.qty-actualjob.qtydone;
						var auxnfcWr=nfcWr;
						var auxNfc=nfcWr.split("**");
						if (actualjob.qtydone==actualjob.qty){
							actualjob.status="stop";
						}
						//22aaee3344ff**RO**122**211**432**223
						var tagObj={
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
						//Save tag to ddbb
						var pt=await apiSql.insertTag(tagObj);   //No caldria ser sincron
						//Update qtydone of job in ddbb
						var pj=await apiSql.putActiveJob(actualjob);
						console.log("\t"+chalk.green("-> Success. Speed: "+speed+" ms. Finishing job in "+((speed*left)/1000)+" seconds."));
						if (actualjob.status=="stop"){
							console.log(chalk.green("Job "+actualjob.name+" Finished."));
						};
					}else{
						//apiGpio.buzzer();
						var ans = readlineSync.question('\t -> Solve the issue and press enter to continue');
					};
				};
			};
		};
		//2- While job active:
		//2.1- tell arduino to put one sticker in position
		//2.2- read URL from QR
		//2.3- tell arduino to write & Rom the decoded url
		//2.4- save data to DDBB
		//2.5- Goto 2.
	};
	return deferred.promise;
};

//Export module
module.exports=apiTictapper;
