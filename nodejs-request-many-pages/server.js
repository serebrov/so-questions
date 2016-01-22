var util = require('util');
var express = require('express');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

var app = express.createServer();
app.successCount = 0;
app.errorCount = 0;

app.get('/apptest', function(req, res) {
  res.send(
    util.format(
      'I am OK, successCount: %s, errorCount: %s',
      app.successCount, app.errorCount
    ), 200
  );
});

app.get('/asynctest', function(req, res) {
  var people = [];
  for (var a = 1000; a < 3000; a++) {
    people.push("http://www.example.com/" + a + "/person.html");
  }

  async.mapLimit(people, 20, function(url, callback) {
    // iterator function
    var options2 = {
      url: url,
      headers: {
        'User-Agent': req.headers['user-agent'],
        'Content-Type': 'application/json; charset=utf-8'
      }
    };

    request(options2, function(error, response, body) {
      if (!error) {
        console.log('success requesting: ' + options2.url);
        var $ = cheerio.load(body);
        app.successCount += 1;
      } else {
        console.log(
          'error requesting: %s, error: %s, status: %s',
          options2.url, error, response.statusCode
        );
        app.errorCount += 1;
      }
      callback();
    });
  });
});

app.listen(3000, function() {
  console.log(
    "Express server listening on port %d in %s mode",
    app.address().port, app.settings.env
  );
});
