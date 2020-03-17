const {exec} = require('child_process');

exec('/usr/lib/python2.7 qr_test_1.py',(err,stdout,stderr) => {
	console.log(stdout);
});