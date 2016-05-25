  var port = process.argv[2] || 8888,
    express = require('express'),
    app = express();
// var http = require("http"),
    // url = require("url"),
    // path = require("path"),
    // fs = require("fs")
    // jobs = {},
    // _ = require('underscore-node'),
    // convertedFolder = '/public/converted/',
    // multer = require('multer');

//var convertUpload = multer({dest: __dirname + '/public/uploads/'}).single();


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));


// conversion is now done on the client-side so this isn't needed

//app.use(express.static(__dirname + '/public/converted'));
// app.post('/convert', convertUpload, function(req, res) {
// 	var xml = require('xml'),
// 		data = JSON.parse(req.body.data),
// 		convertOpts = convertOptions(req);

// 	convertData(data, {}, function(err, data) {
// 		if(err) {
// 		  res.end(JSON.stringify({error: 'failed to convert: ' + err}));
// 		  return;
// 		}

// 		var xmlData = xml(data, {indent: '\t'}),
// 			fileName = newXMLFileName();

// 		writeXMLFile(xmlData, convertedFolder + fileName, function(err) {
// 			res.end(JSON.stringify({data: xmlData, file: err ? false : fileName}));
// 		});
// 	})
// });

app.listen(parseInt(port, 10), function () {
    console.log('server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
    require('open')('http://localhost:' + port);
});



// var writeXMLFile = function(xmlData, filePath, callback) {
// 	var fs = require('fs'),
// 		basePath = require('path').dirname(require.main.filename);

// 	if(!_.isFunction(callback)) {
// 		callback = _.noop;
// 	}

// 	fs.writeFile(basePath + '/' + filePath, xmlData, callback); 
// }

// var newXMLFileName = function() {
// 	return Date.now() + '.xml';
// }



