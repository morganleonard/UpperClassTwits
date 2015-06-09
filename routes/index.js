var express = require('express');
var router = express.Router();
var app = require('../app')
var moment = require('moment');
var redis = require('redis');
var cache = redis.createClient();




router.get('/', function(request, response, next) {
  var username = null;

  
  // set username cookie if it exists
  if (request.cookies.username != undefined) {
    username = request.cookies.username;


// /********************************************REDIS CACHING **************************************************/

//   //check cache
//   database = app.get('database');
//   cache.lrange('posts', 0, -1, function(err, cachedPosts) {
//   console.log(cachedPosts)
  
//     //not in cache, fetch and store
//     if (cachedPosts.length < 1) {
  
//       //fetch posts from db
//       database('posts').select().then(function(retrievedPosts) {
//         //set the cache
//         //console.log(retrievedPosts)
//         cache.lpush('posts', retrievedPosts);
//         // response to browser
//         response.render('index', { title: 'Upper Class Twits', username: username, posts: retrievedPosts})
//       })
//     //  
//     } else {

//       response.render('index', { title: 'Upper Class Twits', username: username, posts: cachedPosts[0]})
//       //console.log(cachedPosts[0][1])
//     }
//   })

// /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

/********************************************OLD DB  Query **************************************************/
    //get posts from database and render page with retrieved posts object
    database = app.get('database');
    database('posts').select().then(function(retrievedPosts) {
      console.log(retrievedPosts)
      retrievedPosts.sort(function (a, b) {
        if (a.post_number > b.post_number) {
            return -1;
        }

        if (b.post_number > a.post_number) {
            return 1;
        } 
        else {
            return 0;
        }
      })
      response.render('index', { title: 'Upper Class Twits', username: username, posts: retrievedPosts});
    })
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


  // no username cookie, redirect to login page
  } else {
    username = null;
    response.render('login', { title: 'Upper Class Twits', username: username });
  }

});

//POST handler for registering new user
router.post('/register', function(request, response) {
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      database = app.get('database');


/****************check if username already exists **************/

  //insert code to check if username exists, if it does, redirect to 'login' with error

/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/    

  if (password === password_confirm) {

/****************************************** send verification email ********************************/

/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


/********************************* move add user to verification email handler ********************************/

    database('users').insert({
      username: username,
      password: password,
    }).then(function() {
      response.cookie('username', username)
      response.redirect('/');
    });

/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
  } else {
    
    response.render('login', {
      title: 'Authorize Me!',
      user: null,
      error: "Password didn't match confirmation"
    });
  }
});

//POST handler for logging in existing users
router.post('/login', function(request, response) {
  var username = request.body.username,
      password = request.body.password,
      database = app.get('database');

  database('users').where({'username': username}).then(function(records) {
    if (records.length === 0) {
        response.render('login', {
          title: 'Authorize Me!',
          user: null,
          error: "No such user"
        });
    } else {
      var user = records[0];
      if (user.password === password) {
        response.cookie('username', username);
        response.redirect('/');
      } else {
        response.render('login', {
          title: 'Authorize Me!',
          user: null,
          error: "Password incorrect"
        });
      }
    }
  });
});


//POST router to handle adding posts 
router.post('/addpost', function(request, response) {

  //set up vars for passing into db
  var username = request.cookies.username,
      postText = request.body.postText,
      postTime = new Date(),
      database = app.get('database');

  // console.log(username);
  // console.log(postTime);

  //knex call to add post to database   
  database('posts').insert({
    username  : username,
    body      : postText,
    posted_at : postTime
  }).then(function() {
      // clear cache because it is outdated

      response.redirect('/');
    });
  }) 

//POST router to handle logging out 
router.post('/logout', function(request, response) {

  response.clearCookie('username');
  response.redirect('/');

  }) 

module.exports = router;
