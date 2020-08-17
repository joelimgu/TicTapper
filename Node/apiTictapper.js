var Q = require("q");
const chalk = require('chalk');
var setup = require('./setup');
var _ = require('lodash');
var DDBB = require("./DDBB.js");
var Database = require("./DatabaseClass");
var Arduino = require ("./ArduinoClass")
const delay = require('delay');
const logUpdate = require('log-update');
var apiQRGun = require("./apiQRGun.js");

var machine = { // creates an object to be passed onto the http conection to send data to the Angular page
    status: "off",
    databaseName: setup.sql.database,
    databaseConnected : false,
    arduinoConnected : false,
    lastJobDone : undefined,
    currentJob : undefined,
		error : undefined,
    finishedTime: undefined,
    order: undefined
  }



const frames = ['-', '\\', '|', '/']; // used to create the loading animation in the looking for active job
var database
var arduino
var apiTictapper = {
	qrGun: new apiQRGun()
};


async function RecieveAngularOrder(){
    let deferred = Q.defer();
    let actualOrder = machine.order;
    let i = 1;
    while (actualOrder == machine.order) {
      await delay(100);
      i ++;
      loadingAnimationForCearchingJobs(i, "Waiting for an order")
    }
    machine.error = undefined
    machine.order = undefined
    deferred.resolve();
    return deferred.promise;
}


function loadingAnimationForCearchingJobs(i, msg){//animates the porcess of searching an active job in the database
	frame = frames[i%4]
  logUpdate(chalk.blue.bold(msg +` (${frame})`));
}

//++++++++++++++++++++++++++++++INSERT TAG TO DB+++++++++++++++++++++++++++++++++++++++++++++++++++++++
function createTagObj(job, nfcWr, speed){
  let deferred = Q.defer();

	var tagObj = {
		job_id: job.id,
		url: nfcWr.command,
		uid: nfcWr.tagID,
		status: "Success",
		timespent: speed,
		timeToDetect: nfcWr.timeToDetect,
		timeToIdentify: nfcWr.timeToIdentify,
		timeToRead: nfcWr.timeToRead,
		timeToWrite: nfcWr.timeToWrite,
		datum: null,
		created_at: Date.now()
	};

  deferred.resolve(tagObj);
  return deferred.promise;
};


//++++++++++++++++++++++++SET ROM++++++++++++++++++++++++++++++++++++++++++++++++
function setRom(job){ //sets the rom of the arduino
  let rom = "D"; //Don not rom stickers for this job
  if (job.rom == 1)		rom = "C"; //Rom stickers for this job
	arduino.write(rom).then().catch((err) => {console.log(chalk.red.bold(err));
                                            machine.error = err;})
};



//++++++++++++++++++++++++++INIT++++++++++++++++++++++++//
const initialize = async function(){
  let deferred = Q.defer();
	machine.status = "Initializing..."
  try {//easier to use try catch with the awaits
    database = await new Database(setup.sql.database, "jobs", "tags");//created the db object to interact with the db
		arduino = await new Arduino(); // creates the arduino object
		let arduinoSetup = setup.antenna_a;// saves the satup info for the arduino, only for easier redability later, no necessary
    await Promise.all([arduino.connect(arduinoSetup.port, arduinoSetup.bauds), database.connect(setup.sql)]).then((msg) => { //connects to the database and creates the connections to the arduino
          console.log(chalk.green("-> Arduino " + msg[0]));
          console.log(chalk.green("-> Database " + msg[1]));
					machine.databaseConnected = true;
					machine.arduinoConnected = true;
    });

    await Promise.all([database.runQuery(DDBB.DEFAULT_JOBS_TABLE),database.runQuery(DDBB.DEFAULT_TAGS_TABLE)]);//ensures that the tables exist and if not creates them

    deferred.resolve();

  }catch(err){
    console.log(chalk.red(err));
		machine.error = err
  }
  return deferred.promise;
};



//+++++++++++++++++++++++++++MAIN LOOP++++++++++++++++++++++++++
const mainLoop = async function() {
	var deferred = Q.defer();
	let N = 0;
	while(true){	//En principi no ha de sortir mai d'aquí

		machine.status = "Looking for a Job"
		N++;
		loadingAnimationForCearchingJobs(N, "Looking for active job");

		var job = await database.getActiveJob();	//Gets the first active job found
    job = job[0]; //gets the job as a dictionary as the raw data is an array of one item but wiht the proises you gave to do it after getting the raw data [{id:1,name:....}] --> {id:1,name:....}



    if (database.db != machine.databaseName) await database.updateDB(machine.databaseName); // updated the db if requested by the user after finishing a job



		if (!_.isEmpty(job)){                   //if ther's a job:
			console.log(chalk.blue("Found: " + job.name));
			console.log(chalk.green("Found active job:" + job.ref + " " + job.name + " " + job.qtydone + "/" + job.qty));
			machine.status = ("Found a Job: " + job.ref)

      setRom(job);//says to the arduino if it has to rom or not

			//Set first sticker on position:
			//console.log(chalk.green("Put the first sticker in the NFC pad and scan the qr code to continue"));

			while ( job.qtydone < job.qty ){
				machine.currentJob = job;

			  let start = Date.now();   //stores the start time to know how much it took later
				console.log(chalk.cyan.bold("Put the first sticker in the NFC pad and scan the qr code to continue"));
				console.log(chalk.cyan("\tProcessing sticker " + (job.qtydone+1) + "/" + job.qty)); //infos the user of the progress made

				machine.status = "Waiting for the URL from QR gun "
				let url = await apiTictapper.qrGun.getUrl();  //gets the url

				//var nfcWr = await apiDevice.nfcWrite(url);  //writes the url
				try{
					machine.status = "Writing the NFC Tag"
          console.log("Writing the NFC Tag");
					var nfcWr = await arduino.write(url) //writes the url to the tag and returns a dictionary with all the operation info



        }catch(err){
				console.log(chalk.red.bold("an error has accurred while writing the NFC tag: " + err));
				machine.error = err
        await RecieveAngularOrder();
				}

        if (machine.order == "Save tag"){
          console.log(chalk.cyan("Saving tag ot db"));
          try {
            job.qtydone++;

            if (job.qtydone == job.qty){
              job.status = "stop";
            };

            var speed = (Date.now()-start);
            machine.finishedTime = speed;
            var left = job.qty - job.qtydone;

            let tagObj = await createTagObj(job, nfcWr, speed);  //saves all the tag info on a dictionary to be used by a query to inser it to th db

            //saves the tag into th db and updates the active job
            await Promise.all([database.insertTag(tagObj), database.updateJobQty(job)]).then((msg) => {deferred.resolve(job)}).catch((err) => {throw err});

            console.log("\t" + chalk.green("-> Success. Speed: " + speed + " ms. Finishing job in " + ((speed*left)/1000) + " seconds."));

            if (job.status == "stop"){ //infos the user that the job has been finished ( should add a log aftes the while to inform the end)
              console.log(chalk.green("Job " + job.name + " Finished."));
            };

          }catch(err){
              console.log(chalk.red("An error has occured : " + err));
              machine.error = "An error occurred while saving the tag to DB, it has't been done, if roamed it can be discarted, if not try again"
          };
        } else{
          machine.status = "Didnt save the tag to db, continuing the program"
        }
			}
		}
		//2- While job active:
		//2.1- tell arduino to put one sticker in position
		//2.2- read URL from QR
		//2.3- tell arduino to write & Rom the decoded url
		//2.4- save data to DDBB
		//2.5- Goto 2.
		//await delay(1000);
	}
	return deferred.promise;
}


//+++++++++++++++++++++++++++HTTP Conection++++++++++++++++++++++++++++++++++++++

const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json())

var corsOptions = {
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

app.listen(4300, () => {
  console.log('Node server started!')
})

app.route('/api/machine').get((req, res) => {
  res.send(machine)
})

app.route('/api/test').get((req, res) => {
  res.send("Node Server Up!")
})

app.route('/api/status').get((req, res) => {
  res.send(machine.status)
})

app.route('/api/updateDB').post((req, res) => {
  res.status(201).send(req.body)
  console.log("post req: " + JSON.stringify(req.body));
  machine.databaseName = req.body.newDB
})

app.route('/api/addNewJob').post((req, res) => {
  res.status(201).send(req.body)
  console.log("post req: " + JSON.stringify(req.body));
  console.log("creatign job...");
  database.insertJob(req.body.newJob);
})


app.route('/api/getLastEditedJob').get(async (req, res) => {//returs the last edited job to be displayed
  let lastJob = await database.getLastEditedJob();
  res.send({lastJob: lastJob})
})


app.route('/api/order').post((req, res) => {
  res.status(201).send(req.body)
  console.log("post req: " + JSON.stringify(req.body));
  machine.order = req.body.order;
})


// app.route('/api/getcurrentJob').get((req, res) => {
//   res.send(machine.currentJob)
// })


//Export module
module.exports = {initialize, mainLoop};
