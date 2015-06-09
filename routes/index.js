var express = require('express');
var router = express.Router();
var app = require('../app')
var moment = require('moment');
var uuid = require('node-uuid');


// array for stashing user info for users to add to db after verification
var usersToAdd = [];


//GET Router to handle home page where all posts are displayed
router.get('/', function(request, response, next) {
  var username = null;
  
  if (request.cookies.username != undefined) {
    //set cookie
    username = request.cookies.username;

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

  if (password === password_confirm) {
	//stash username, password and nonce to be able to add to db later after verification
	var newNonce = uuid.v4();
	usersToAdd.push({nonce : newNonce, username : username, password : password})
	console.log(usersToAdd);

	/****************************************** send verification email ********************************/
	// use nonce from usersToAdd and send to user
	// user nodemailer
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	//redirect to login page with error for verifying email
	response.render('login', {
      title: 'Authorize Me!',
      user: null,
      error: "Please click the link in your email"
    });


	// /********************************* move add user to verification email handler ********************************/
	//     database('users').insert({
	//       username: username,
	//       password: password,
	//     }).then(function() {
	//       response.cookie('username', username)
	//       response.redirect('/');
	//     });
	// /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

  } else {
    response.render('login', {
      title: 'Authorize Me!',
      user: null,
      error: "Password didn't match confirmation"
    });
  }
});


//GET handler for email verification
router.get('/verify_email/:nonce', function(request, response) {
	database = app.get('database');
	var returnedNonce = request.params.nonce;
	console.log(returnedNonce);

	// iterate through usersToAdd array and add user to db if nonce match is found
	usersToAdd.forEach(function (user) {
		if(user.nonce === returnedNonce) {
			database('users').insert({
				username : user.username,
				password : user.password
			}).then(function () {
				response.cookie('username', user.username)
				response.redirect('/');
			})
		}
	})


    // redisClient.get(request.params.nonce, function(userId) {
    //     redisClient.del(request.params.nonce, function() {
    //         if (userId) {
    //             new User({id: userId}).fetch(function(user) {
    //                 user.set('verifiedAt', new Date().toISOString());
    //                 // now log the user in, etc.
    //             })
    //         } else {
    //             response.render('index',
    //                 {error: "That verification code is invalid!"});
    //         }
    //     });
    // });
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
      response.redirect('/');
    });
  }) 

//POST router to handle logging out 
router.post('/logout', function(request, response) {

  response.clearCookie('username');
  response.redirect('/');

  }) 

module.exports = router;
