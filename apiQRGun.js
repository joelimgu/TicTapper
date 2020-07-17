/*
API to deal with QR Gun
*/

var Q = require("q");
var LinuxInputListener = require('linux-input-device');
var setup = require('./setup');
var events = require("events");
const chalk = require('chalk');

var SW_LID = 0x00;
//var input = new LinuxInputListener(setup.keyboard_id); //usb-0581_020c-event-kbd');
var str="";
var sample = [];
//QR Gun codification chars:
var codes={ 30 : 'a', 48 : 'b', 46 : 'c', 32 : 'd', 18 : 'e', 33 : 'f', 34 : 'g', 35 : 'h', 23 : 'i', 36 : 'j', 37 : 'k', 38 : 'l', 50 : 'm', 49 : 'n', 24 : 'o', 25 : 'p', 16 : 'q', 19 : 'r', 31 : 's', 20 : 't', 22 : 'u', 47 : 'v', 17 : 'w', 45 : 'x', 21 : 'y', 44 : 'z', 11 : '0', 2 : '1', 3 : '2', 4 : '3', 5 : '4', 6 : '5', 7 : '6', 8 : '7', 9 : '8', 10 : '9', 52 : '.', 53 : '/', 39 : ':', 12 : '-' };


//Constructor method
function apiQRGun(){
	//this.sv1 = sv1;

	this.input = new LinuxInputListener(setup.keyboard_id);//creates an event whan recives data from setup.keyboard_id
	this.eventEmitter = new events.EventEmitter();
	var emitter = this.eventEmitter;

	this.input.on('open', () => this.input.query('EV_SW', SW_LID));

	this.input.on('error', console.error);

	this.input.on('state', function(value, key, kind) {
	    //console.log('State is now:', value, 'for key', key, 'of kind', kind);
	    if (value){
		    if (key!=28){
		    	sample.push(key);
		    }else{
		    	//console.log(apiQRGun.mapIt(sample));
		    	var waitTill = new Date(new Date().getTime() + 250);	//Esperem 250 ms abans de tornar a 10 graus (és possible que el servo encara estigui en moviment anterior, anant cap a 60 degrees)
					while(waitTill > new Date()){};
		    	//var waitTill = new Date(new Date().getTime() + 500);
					//while(waitTill > new Date()){};
		    	emitter.emit('data', apiQRGun.mapIt(sample));
		    	sample = [];
		    };
			};
	});
};


apiQRGun.prototype.getUrl = function(){
	var deferred = Q.defer();
	var emitter = this.eventEmitter;
	emitter.on('data',function(data){
		emitter.removeAllListeners('data');
		console.log("\t"+chalk.yellow("-> ["+Date.now()+"] " + data.replace(/(\r\n|\n|\r)/gm,"")));
		deferred.resolve(data);
	});
	return deferred.promise;
};


//suposo que transforms la url "dolenta" de la pistola QR en la bona transformant els caracters falsos
apiQRGun.mapIt = function(val){
	mayus = false;
	str='';
	val.forEach(function(elem){
		if (elem == 42){
			mayus = true;
		}else{
			if (mayus){
				str = str+codes[elem].toUpperCase();
			}else{
				str = str+codes[elem];
			}
			mayus = false;
		};
	});
	return str;
};

//Export module
module.exports = apiQRGun;
