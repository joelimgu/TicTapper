var Q = require("q");

async function a() {
  //deferred.resolve("a")
  throw "a"
  return deferred.promise;
}

async function b(){
  try {
  await a();
  } catch (e) {
    console.log("b");
  }
}


b()
