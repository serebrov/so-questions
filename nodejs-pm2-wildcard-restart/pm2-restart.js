var pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.list(function(err, processDescriptionList) {
    if (err) throw err;
    for (var idx in processDescriptionList) {
      var name = processDescriptionList[idx]['name'];
      console.log(name);
      if (name.startsWith('foo')) {
        pm2.restart(name, function(err, proc) {
          if (err) throw err;
          console.log('Restarted: ');
          console.log(proc);
        });
      }
    }
  });
});
