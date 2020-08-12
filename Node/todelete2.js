

var machine = {
    status: "off",
    databaseConnected : false,
    arduinoConnected : false,
    lastJobDone : undefined,
    currentJob : undefined
  }

machine.status = "ok"


function getStatus(){
  console.log("called getStatus");
  return machine.status;
}

console.log(machine.status);
module.exports = {getStatus};
