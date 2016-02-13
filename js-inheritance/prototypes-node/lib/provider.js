var providerPrototype = {
  name: 'Prototype',
  alertName: function() {  // this is common function, all objects
    console.log(this.name);      // will have it
  }
};
module.exports = providerPrototype;
