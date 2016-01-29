var myModule = {};
module.exports = myModule;

myModule.authenticateUser = function(req,res,next){
  var token = req.method =="GET" ? req.query.token : req.body.token;
  if(!token) return myModule.authenticationFailure (req,res);

  myModule.verify(token, function(err,user){
      if(err) return this.authenticationFailure (req,res);

      req.body.user = user;
      next();
  });
};

myModule.authenticationFailure = function(req,res){
  res.json({response:"Failed to authenticate"});
};
