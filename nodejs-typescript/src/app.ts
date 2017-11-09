import express = require('express');
import http = require('http');
import path = require('path');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.static((path.join(__dirname, 'public'))))
app.get('/', function(req: express.Request, res: express.Response) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
