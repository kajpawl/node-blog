var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var mongodb = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  var authors = db.get('authors');
  authors.find({}, {}, function(err, items) {
    authors = items;
  });
  categories.find({}, {}, function(err, categories) {
    res.render('addpost', { title: 'Add Post', categories: categories, authors: authors });
  });
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  // check image upload
  if (req.file) {
    console.log('Yes');
    var mainimage = req.file.filename;
  } else {
    console.log('no');
    var mainimage = 'noimage.jpg';
  }

  // form validation
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();

  // check errors
  var errors = req.validationErrors();

  if (errors) {
    res.render('addpost', {
      errors: errors
    });
  } else {
    var posts = db.get('posts');
    posts.insert(
      {
        title: title,
        body: body,
        category: category,
        date: date,
        author: author,
        mainimage: mainimage
      },
      function(err, post) {
        if (err) {
          res.send(err);
        } else {
          req.flash('success', 'Post added');
          res.location('/');
          res.redirect('/');
        }
      }
    );
  }
});

module.exports = router;
