var Q = require("q");

async function a(a) {
  let deferred = Q.defer();
  deferred.resolve()
//  throw "a"
  return deferred.promise;
}

async function b(){
  try {
    console.log();
  let a = await a();
  } catch (e) {
    console.log("b" + e);
  }
}


b()
