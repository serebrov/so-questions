var providerPrototype = {
  name: 'Prototype',
  alertName: function() {  // this is common function, all objects
    console.log(this.name);      // will have it
  }
};

var appleProvider = Object.create(providerPrototype);
appleProvider.name = 'Apple';
// this is a specific function for 'Apple'
appleProvider.getCatalog = function(callback) {
  return callback(null, ['iPhone', 'Mac Mini']);
}
appleProvider.alertName = function() {
   // call 'base' method
   providerPrototype.alertName.call(this);
   console.log('All rights reserved.');
}

var samsungProvider = Object.create(providerPrototype);
samsungProvider.name = 'Samsung';
// this is a specific function for 'Samsung'
samsungProvider.getCatalog = function(callback) {
  return callback(null, ['Galaxy S3', 'Galaxy S4']);
}

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
