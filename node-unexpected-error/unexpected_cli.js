var express = require('express');
var request = require('request');
var fs = require('fs');

var app = express();

module.exports = app;

app.get('/run', function (clientRequest, clientResponse) {
    var readStream = fs.createReadStream('./test.wav');
    //var req = request.post('http://127.0.0.1/speech');
    readStream.on('end',function(){
        console.log("readStream end>>>>>>>>>>>>>>>>>>>>>>");
        // req.end(function (err, res) {
        //     console.log("req.end callback>>>>>>>>>>>>>>>");
        //     done();
        // });
    });
    readStream.pipe(request.post('http://127.0.0.1:3000/speech'));
});

app.listen(3001, function() {
  console.log("App started");
});
