let {PythonShell} = require('python-shell');

let options={
	pythonPath: '/usr/lib/python2.7'
};

PythonShell.run('qr_test_1.py',options, function(err,results){
	if (err){
		throw err;
	}
	console.log(results);
});
