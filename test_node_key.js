var LinuxInputListener = require('linux-input-device');

var SW_LID = 0x00;

var input = new LinuxInputListener('/dev/input/by-id/usb-2D_IMAGER_2D_IMAGER-event-kbd'); //usb-0581_020c-event-kbd');

var str="";
var sample = [];

//QR Gun codification chars:
var codes={ 30 : 'a', 48 : 'b', 46 : 'c', 32 : 'd', 18 : 'e', 33 : 'f', 34 : 'g', 35 : 'h', 23 : 'i', 36 : 'j', 37 : 'k', 38 : 'l', 50 : 'm', 49 : 'n', 24 : 'o', 25 : 'p', 16 : 'q', 19 : 'r', 31 : 's', 20 : 't', 22 : 'u', 47 : 'v', 17 : 'w', 45 : 'x', 21 : 'y', 44 : 'z', 11 : '0', 2 : '1', 3 : '2', 4 : '3', 5 : '4', 6 : '5', 7 : '6', 8 : '7', 9 : '8', 10 : '9', 52 : '.', 53 : '/', 39 : ':', 12 : '-' };

function mapIt(val){
	mayus=false;
	str='';
	val.forEach(function(elem){
		if (elem==42){
			mayus=true;
		}else{
			if (mayus){
				str=str+codes[elem].toUpperCase();
			}else{
				str=str+codes[elem];
			}
			mayus=false;
		}
	});
	return str;
}

input.on('state', function(value, key, kind) {
    //console.log('State is now:', value, 'for key', key, 'of kind', kind);
    if (value){
	    if (key!=28){
	    	sample.push(key);
	    }else{
	    	console.log(mapIt(sample));
	    	sample = [];
	    }
	}
});

input.on('error', console.error);

//start by querying for the initial state.
input.on('open', () => input.query('EV_SW', SW_LID));
