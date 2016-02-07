var hljs = require('highlight.js');
var _ = require('lodash');
var express = require('express');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var app = express();
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

getCode = function getCode(args) {
  return hljs.highlight('javascript', args.callee.toString()).value;
}

var Schema = mongoose.Schema;

var userSchema = new Schema({
  name:  String,
  email: String
}, {
  strict: 'throw'
});
var User = mongoose.model('User', userSchema);

var CommentSchema = new Schema({
  author  : {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  body: String
})
var Comment = mongoose.model('Comment', CommentSchema);

var PostSchema = new Schema({
  title:  String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
  body:   String,
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
}, {
  strict: 'throw'
});
PostSchema.plugin(deepPopulate, {
  populate: {
    'author': {
      select: 'name'
    },
    'comments': {
      select: 'title author'
    },
    'comments.author': {
      select: 'name'
    },
  }
});
var Post = mongoose.model('Post', PostSchema);

var createComment = function(post, user, num) {
    var comment = new Comment;
    comment.author = user._id;
    comment.title = 'comment' + num;
    comment.body = 'comment' + num + ' body';
    comment.save(function(err, comment) {
      if (err) throw err;
      post.comments.push(comment._id);
      post.save();
      console.log('Comment: ' + comment);
    });
}

var createOrFindUser = function(name, email, callback) {
  User.findOne({name: name} , function(err, user) {
    if (err) throw err;
    if (!user) {
      var newUsr = new User({name: name, email: email});
      newUsr.save(function(err, newUsr) {
        if (err) throw err;
        console.log(name + ': ', newUsr._id);
        callback(newUsr);
      });
    } else {
      callback(user);
    }
  });
}

app.theUserTester = null;
app.theUserPoster = null;

//Connect to mongo
app.use(function(req, res, next) {
  if (mongoose.connection.readyState > 0) {
    return next();
  }
  mongoose.connect('mongodb://localhost/mongotestdeeppop');
  mongoose.connection.on('error', function(err) {
    next(err);
  });
  mongoose.connection.on('open', function() {
    createOrFindUser('Tester', 'tester@example.com', function(user) {
      app.theUserTester = user;
    });
    createOrFindUser('Poster', 'poster@example.com', function(user) {
      app.theUserPoster = user;
    });
  });
});

app.get('/', function (req, res, next) {
  app.code = getCode(arguments);
  var blog = new Post;
  blog.title = 'test';
  blog.body = 'test';
  blog.author = app.theUserTester._id;
  blog.save(function(err, post) {
    if (err) throw err;
    createComment(post, app.theUserPoster, 1);
    createComment(post, app.theUserTester, 2);
    Post.find(function(err, data) {
      var out = JSON.stringify(data, null, 4);
      res.render('data', {
        page: 'home',
        title: 'Mongoose - Creates a new model on each call',
        code:app.code,
        data: hljs.highlight('json', out).value});
    });
  });
});

app.get('/refs', function (req, res, next) {
  app.code = getCode(arguments);
  Post.find().select('title author comments').deepPopulate('author comments.author').exec(function(err, data) {
    var out = JSON.stringify(data, null, 4);
    res.render('data', {
      page: 'refs',
      title: 'Mongoose - Post with deep populated data, only title for post',
      code:app.code,
      data: hljs.highlight('json', out).value});
  });
});

app.get('/refsfull', function (req, res, next) {
  app.code = getCode(arguments);
  Post.find().deepPopulate('author comments.author').exec(function(err, data) {
    var out = JSON.stringify(data, null, 4);
    res.render('data', {
      page: 'refs',
      title: 'Mongoose - Post with deep populated data, all data for post',
      code:app.code,
      data: hljs.highlight('json', out).value});
  });
});

app.get('/clear', function (req, res, next) {
  Comment.remove(function(err, data) {
    if (err) throw err;
    Post.remove(function(err, data) {
      if (err) throw err;
      User.remove(function(err, data) {
        if (err) throw err;
        res.redirect('/');
      });
    });
  });
});


var server = app.listen(3008, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
});
