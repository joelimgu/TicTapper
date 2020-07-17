var Q = require("q");
var apiTictapper = require('./apiTictapper');

async function main(){
	console.log("Initialize Systems");
	await apiTictapper.initialize();

	/* CHECK QUE TOT ESTÀ OK */

	await apiTictapper.mainLoop();

	console.log("Program exiting. Good Bye!");
}

console.log("Main program start");
main();
