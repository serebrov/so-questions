providerPrototype = require('./provider');

var samsungProvider = Object.create(providerPrototype);
samsungProvider.name = 'Samsung';
// this is a specific function for 'Samsung'
samsungProvider.getCatalog = function(callback) {
  return callback(null, ['Galaxy S3', 'Galaxy S4']);
}
module.exports = samsungProvider;
