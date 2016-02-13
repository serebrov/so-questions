providerPrototype = require('./provider');

var appleProvider = Object.create(providerPrototype);
appleProvider.name = 'Apple';
// this is a specific function for 'Apple'
appleProvider.getCatalog = function(callback) {
  return callback(null, ['iPhone', 'Mac Mini']);
}
module.exports = appleProvider;
