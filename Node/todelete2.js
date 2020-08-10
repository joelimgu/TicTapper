

var machine = {
    status: "off",
    databaseConnected : false,
    arduinoConnected : false,
    lastJobDone : undefined,
    currentJob : undefined
  }

machine.status = "on"

console.log(machine.status);
module.exports = {machine};
