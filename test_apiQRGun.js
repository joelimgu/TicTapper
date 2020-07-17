var Q = require("q");
var apiQRGun = require("./apiQRGun.js");
var setup = require('./setup');


console.log("Start test");

myGun = new apiQRGun();


async function test(){
	var url = await myGun.getUrl();
	console.log(url);

	var url = await myGun.getUrl();
	console.log(url);

	var url = await myGun.getUrl();
	console.log(url);

	var url = await myGun.getUrl();
	console.log(url);
}

test();

/*
myGun.getUrl().then(function(d){
	console.log("resolved promise awaiting URL",d);
});
*/
