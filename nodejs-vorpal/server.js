var vorpal = require('vorpal')();

vorpal
.command('rollto <num>', 'Rolls to')
.action(function(arguments, callback) {
    rollto(arguments, callback);
});

function rollto(arguments, callback) {
    var num = arguments.num;
    timer1 = setInterval(function () {
        console.log('test');
        console.log(num);
        clearInterval(timer1);
        callback();
    }, 1000);
}

vorpal
  .delimiter('myapp$')
  .show();
