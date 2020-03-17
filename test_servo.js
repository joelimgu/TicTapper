var PiServo = require('pi-servo');

var sv1 = new PiServo(4);

sv1.open().then(function(){
        init(); 
});

async function init(){
        sv1.setDegree(10);
        await sleep(1000);
        sv1.setDegree(60);
        await sleep(1000);
        sv1.setDegree(10);
}
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}