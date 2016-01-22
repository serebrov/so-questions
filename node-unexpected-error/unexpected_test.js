//var fs = require('fs');
//var chai = require('chai');
//var chaiHttp = require('chai-http');

//var http = require('http');
////var request = require('request');

//chai.use(chaiHttp);
//var app = require('./unexpected');

// Run test with mocha
// npm install -g mocha
// mocha unexpected_test.js


//describe('server', function() {
//    this.timeout(10000);
//    it('should WORK!!!"', function (done){
//        var dones = 0;
//        var readStream = fs.createReadStream('./test.wav');
//        var req = chai.request(app).post('/speech');
//        // if pipe is here, I get:
//        //
//        //    pipe
//        //    readStream end>>>>>>>>>>>>>>>>>>>>>>
//        //    speech
//        //    im at the end>>>>>
//        //    json parser: {"a":"b"}{"a":"b"}
//        //    req.end callback>>>>>>>>>>>>>>>
//        //        ✓ should WORK!!!"
//        //    double callback!
//        //    json parser: {"a":"b"}{"a":"b"}
//        //    double callback!
//        //    double callback!
//        //
//        //      1 passing (43ms)
//        //
//        // node_modules/chai-http/node_modules/superagent/lib/node/index.js
//        // 744:  if (this.called) return console.warn('double callback!');
//        readStream.on('end',function(){
//            console.log("readStream end>>>>>>>>>>>>>>>>>>>>>>");
//            req.end(function (err, res) {
//                console.log("req.end callback>>>>>>>>>>>>>>>");
//                done();
//            });
//        });
//        // if pipe is here, I get:
//        //
//        //
//        //    pipe
//        //    readStream end>>>>>>>>>>>>>>>>>>>>>>
//        //    speech
//        //    im at the end>>>>>
//        //    json parser: {"a":"b"}{"a":"b"}
//        //        1) should WORK!!!"


//        //      0 passing (38ms)
//        //      1 failing

//        //      1) server should WORK!!!":
//        //         Uncaught SyntaxError: Unexpected token {
//        //          at Object.parse (native)
//        //          at IncomingMessage.<anonymous> (/home/seb/web/x-test/node-unexpected-error/node_modules/chai-http/node_modules/superagent/lib/node/parsers/json.js:9:21)
//        //          at IncomingMessage.EventEmitter.emit (events.js:117:20)
//        //          at _stream_readable.js:920:16
//        //          at process._tickCallback (node.js:415:13)
//        //
//        console.log('pipe');
//        readStream.pipe(req);
//    });
//});

var fs = require('fs');
var chai = require('chai');
var http = require('http');

// Require our application and create a server for it
var app = require('./unexpected');
var server = http.createServer(app);
server.listen(0);
var addr = server.address();

describe('server', function() {
    this.timeout(10000);
    it('should WORK!!!"', function (done){
        // setup read stream
        var readStream = fs.createReadStream('./test.wav');
        readStream.on('end',function(){
            console.log("readStream end>>>>>>>>>>>>>>>>>>>>>>");
        });
        // setup the request
        var request = http.request({
            'host': 'localhost',
            'port': addr.port,
            'path': '/speech',
            'method': 'POST'
        });
        // now pipe the read stream to the request
        readStream.pipe(request).on('finish', function() {
            console.log("pipe end>>>>>>>>>>>>>>>>>>>>>>");
        });
        // get the response and finish when we get all the response data
        request.on('response', function(response) {
            console.log("request end>>>>>>>>>>>>>>>>>>>>>>");
            response.on('data', function(data) {
                console.log('response data: ' + data);
            });
            response.on('end', function(data) {
                console.log('done!');
                done();
            });
        });
    });
});
