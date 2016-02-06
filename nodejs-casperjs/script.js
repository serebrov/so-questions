var fs = require('fs');
var spawn = require('child_process').spawn;
var express = require('express');

// Global dependencies:
// - download an unpack phantomjs, see http://phantomjs.org/download.html
// - clone the casper.js repository, see http://docs.casperjs.org/en/latest/installation.html
// - npm install -g forever
//
// Install init.d script with
//   ./deploy.sh
//
// Check the log under /var/log/caspertest.log
// Forever's log is in the /var/log/syslog
//
// forever + sudo - even 'echo' doesn't work
// forever + regular user - 'echo' works, casperjs doesn't work
//
// npm install -g pm2
// pm2 startup ubuntu
// pm2 start script.js
// pm2 save

var app = express();

var HOME = process.env['HOME'];

var environment = {
  PHANTOMJS_EXECUTABLE: HOME+'/phantomjs-2.1.1-linux-x86_64/bin/phantomjs'
};

var CASPER_PATH = HOME+'/casperjs/bin/casperjs'; // actual binary location, not a symlink
var SCRIPTS_PATH = __dirname+'/server.js';

app.get('/', function(req, res) {
    res.send({status: 'OK' });
});

app.get('/test', function(req, res) {
  //var fileName = req.body.source + '_' + req.body.type + '.coffee'; // looks like: mysource_my_scrape_type.coffee
  console.log('enter');
  var fileName = '';
  var scrapeId = 'test_scrape';
  var user = 'user123';
  var pass = 'pass123';
  if (fs.existsSync(SCRIPTS_PATH + fileName)) {
    console.log('enter here');
    // If file is in place, spawn casperjs
    var args = [SCRIPTS_PATH + fileName, '--ssl-protocol=any', '--user='+user, '--scrapeId='+scrapeId, '--pass='+pass];
    console.log('Start: ', CASPER_PATH);
    console.log('With: ', args);
    console.log('Env: ', environment);
    var sP = spawn(
      //'echo',
      CASPER_PATH,
      args,
      { detached: true, env: environment },
      function (err, stdout, stderr) {
        console.log('callback_err', err);
        //res.send({ callback_err: err });
      });
    sP.stdout.on('data', function(data) {
      console.log('stdout', data.toString('utf8'));
      //res.send({ stdout_data: data });
    });
    sP.stderr.on('data', function(data) {
      console.log('stderr', data.toString('utf8'));
      res.send({ stderr_data: data });
    });
    sP.stdout.on('close', function(code) {
      console.log('close', code);
      //res.send({ close: code });
    });
    sP.stdout.on('error', function(data) {
      console.log('error std');
      console.log('std_error', data);
      //res.send({ std_error: data });
    });
    sP.on('close', function(data) {
      console.log('sp_close');
      console.log('sp_close', data);
      //res.send({ sp_close: data });
    });
    sP.on('error', function(data) {
      console.log('error');
      console.log('sp_error', data);
      //res.send({ sp_error: data });
    });
    sP.on('disconnect', function(data) {
      console.log('disconnect');
      console.log('sp_disconnect', data);
      //res.send({ sp_disconnect: data });
    });
    sP.on('exit', function(code, signal) {
      console.log('sp_exit', code, signal);
      //res.send({ sp_exit_code: code, signal: signal });
    });
    sP.on('message', function(data) {
      console.log('message');
      console.log('sp_message', data);
      //res.send({ sp_message: data });
    });
    //console.log('spawned', sP);
    console.log('spawned');
    res.send({
      scheduled: true, key: scrapeId
    });
  } else {
    res.send({
      scheduled: false, error: 'Incorrect source, type or the script is missing.'
    });
  }
});

app.listen(3000, function() {
  console.log("App started");
});
