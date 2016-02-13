appleProvider = require('./lib/apple');
samsungProvider = require('./lib/samsung');

var providers = [
  appleProvider, samsungProvider
];

var syncCatalogues = function(search, callback) {
  var allItems = [];
  for (var p = 0; p < providers.length; p++) {
    var aProvider = providers[p];
    aProvider.getCatalog(function(err, catalog) {
      if (err) {
        return callback(err);
      }
      aProvider.alertName(); // call the base method
      console.log(catalog);
    });
  }
};

syncCatalogues();
