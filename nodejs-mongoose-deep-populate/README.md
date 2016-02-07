See: http://stackoverflow.com/questions/34786589/mongoose-deep-populate-limiting-intermediate-model/35241056

Schema looks like this:

    var userSchema = new Schema({
      name:  String,
      email: String
    });

    var CommentSchema = new Schema({
      author  : {type: Schema.Types.ObjectId, ref: 'User'},
      title: String,
      body: String
    })

    var PostSchema = new Schema({
      title:  String,
      author: { type: Schema.Types.ObjectId, ref: 'User' },
      comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
      body:   String
    });

    PostSchema.plugin(deepPopulate, {
      populate: {
        'author': { select: 'name' },
        'comments': { select: 'title author' },
        'comments.author': { select: 'name' },
      }
    });

The `deepPopulate` settings above limit fields for related `author`, `comments` and `comments.author`.
To get posts and limit fields for the post itself, I use this:

    Post.find().select('title author comments').deepPopulate('author comments.author').exec(function(err, data) {
        // process the data
    });

The data looks like this:

    [{
        "_id": "56b74c9c60b11e201fc8563f",
        "author": {
            "_id": "56b74c9b60b11e201fc8563d",
            "name": "Tester"
        },
        "title": "test",
        "comments": [
            {
                "_id": "56b74c9c60b11e201fc85640",
                "title": "comment1",
                "author": {
                    "_id": "56b74c9b60b11e201fc8563e",
                    "name": "Poster"
                }
            }
        ]
    }]

So for the post itself we only have `title` (`body` is not selected).
For populated records the selected fields are limited as well.
