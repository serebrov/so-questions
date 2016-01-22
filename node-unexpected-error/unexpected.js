var express = require('express');
var fs = require('fs');

var app = express();

module.exports = app;

app.post('/speech', function (clientRequest, clientResponse) {
    console.log('speech');
    var writeStream = fs.createWriteStream('./test_out.wav');
    //for me on('end'... doesn't work (it infinitely waits for event
    //probably because the file is small and it finishes before we
    //get here
    clientRequest.pipe(writeStream).on('finish', function() {
        console.log('im at the end>>>>>');
        clientResponse.json({'a':'b'});
    });
});

app.listen(3000, function() {
  console.log("App started");
});
