import {PythonShell} from 'python-shell';

let pyshell = new PythonShell('qr_test_1.py');

pyshell.on('message', function (message) {
  console.log(message);
});

pyshell.end(function (err,code,signal) {
  if (err) throw err;
  console.log('The exit code was: ' + code);
  console.log('The exit signal was: ' + signal);
  console.log('finished');
  console.log('finished');
});