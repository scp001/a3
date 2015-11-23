"use strict";

var mongoose = require('mongoose'); // MongoDB integration

var fs = require('fs'),
    // path is "../" since splat.js is in routes/ sub-dir
    config = require(__dirname + '/../config'),  // port#, session params
    express = require("express"),
    _ = require("underscore"),
    url = require("url"),
    bcrypt = require("bcrypt");

// create image-upload directory if it does not exist 
fs.exists(__dirname + '/../public/img/uploads', function (exists) {
    if (!exists) {
        fs.mkdir(__dirname + '/../public/img/uploads', function (err) {
            if (err) {
                process.exit(1);  // can this be cleaned up with throw error???
            };
        });
    }
});

// Connect to database
mongoose.connect('mongodb://' +config.dbuser+ ':' +config.dbpass+
                '@10.15.2.164/' + config.dbname);

// Mongoose Schemas

var MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    released: { type: String, required: true },
    director: { type: String, required: true },
    starring: { type: [String], required: true },
    rating: { type: String, required: true },
    duration: { type: Number, required: true },
    genre: { type: [String], required: true },
    synopsis: { type: String, required: true },
    freshTotal: { type: Number, required: true },
    freshVotes: { type: Number, required: true },
    trailer: String,
    poster: { type: String, required: true },   // poster URL
    userid: {type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema'},
    dated: Date
});

// each Movie title:director pair must be unique; duplicates are dropped
MovieSchema.index({"title":1, "director":1}, {unique: true, dropDups: true});

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});

var ReviewSchema = new mongoose.Schema({
    freshness: { type: Number, required: true },
    reviewtext: { type: String, required: true },
    reviewname: { type: String, required: true },
    reviewaffil: { type: String, required: true },
    movieid: {type: mongoose.Schema.Types.ObjectId, ref: 'MovieSchema'}
});

// each Review name:affil pair must be unique for a given movie (i.e.
// reviewers are allowed only one review per movie); duplicates are dropped
ReviewSchema.index({"reviewname":1, "reviewaffil":1, "movieid":1},
                   {unique: true, dropDups: true});

// Models
var Movie = mongoose.model('Movie', MovieSchema);
var User = mongoose.model('User', UserSchema);
var Review = mongoose.model('Review', ReviewSchema);

// "exports" is used to make the associated name visible
// outside this file (in particular to server.js)
exports.api = function(req, res) {
    res.send(200, '<h3>Splat! 0.2 API is running!</h3>');
};

// return movie requested by id parameter
exports.getMovie = function(req, res) {
    Movie.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" 
                +err.message+ ")" );
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist;"
		+ " try reselecting from browse view");
        } else {
            res.status(200).send(movie);
        }
    });
};

// return movies collection 
exports.getMovies = function (req, res) {
    Movie.find(function(err, movies) {
        if (!err) {
            res.status(200).send(movies);
        } else {
            res.status(404).send("Sorry, no movies found " + err.message);
        }
    });
};

// helper function, not exported
function savePoster(movie, callback) {
    var movieId = movie.get('_id');
    var poster = movie.get('poster');
    if (poster) 
        var imgPrefix = poster.split(';')[0].split("/")[0];
    // only save image if it is a dataURL (not if it is a file path string)
    if (poster && imgPrefix.search(/^data:image$/) === 0) {
        var imgType = poster.split(';')[0].split("/")[1];
        var posterImg = poster.replace(/^data:image\/.*;base64,/, "");
        var posterURL = "img/uploads/" + movieId + "." + imgType;
        var posterPath = __dirname + "/../public/" + posterURL;
        fs.writeFile(posterPath, posterImg, 'base64', function(err) {
	    // invoke caller callback that depends on writeFile result
            if (err) {
                res.status(500).send("Unable to save movie poster at this time " + err );
	    };
	    // add a "random" value to the poster URL so the browser will 
	    // fetch the updated image rather than using its old (cached) 
	    // copy, which has the same root name (modelId.imgType)
	    var timestamp = new Date();
            movie.set('poster', posterURL+'?'+timestamp.getTime());
	    // if this is an image update with a different suffix, 
	    // should remove old image file, else get file proliferation
            // Not implemented here, to add use:  fs.unlink(...) 
	    if (callback) {
	        callback();
	    }
        });
    // no-image to save, but still need to invoke caller's callback
    } else {
        if (callback) {
            callback();
        };
    };
};

exports.addMovie = function (req, res) {
    var movie = new Movie(req.body);
    // set model userid here rather than client, since request must be 
    // server authenticated before the request is handled
    movie.set('userid', req.session.userid);
    savePoster(movie, function() {
      	movie.save(function (err, result) {
            if (!err) {
          	res.status(200).send(movie);
            } else if (err.err && err.err.indexOf("E11000") > -1) {
            	 res.status(403).send("Sorry, movie " +movie.title+ " directed by "
                	    +movie.director+ " has already been created");
            } else {
            	res.status(500).send('Unable to save movie at this time: '
			    + 'please try again later ' + err.message);
            }
    	});
    });
};

exports.editMovie = function(req, res){
  Movie.findById(req.params.id, function(findErr, movie){
    // no DB error and found DB entry matching id value
    if (!findErr && movie) {
	_.extend(movie, req.body);  // populate model with request body fields
        savePoster(movie, function() {
      	    movie.save(function(saveErr){
                if (!saveErr) {
                    res.status(200).send(movie);
                } else if (saveErr.err && saveErr.err.indexOf("E11000") !== -1) {
                    res.status(403).send("Sorry, movie " +req.body.title+ 
				" directed by "
                              +req.body.director+ " already exists.");
                } else if (saveErr.message) {
                    res.status(500).send('Movie update failed: ' + saveErr.message);
		} else {
                    res.status(500).send('Movie update failed');
                }
            });
        })
    // no DB error, but no DB entry matches id value (movie null)
    } else if (!findErr && !movie) {
        res.status(404).send('Sorry, this movie does not exist (perhaps deleted?)');
    } else {
        res.status(500).send('Server is unable to process movie update; '
	    + 'please try again later ' + findErr.message);
    };
  })
};

exports.reviewMovie = function(req, res) {
    Movie.findById(req.params.id, function(err, movie){
          movie.freshVotes += req.body.fresh;
          movie.freshTotal += 1;
          movie.save(function(saveErr, movieResp){
            if(!saveErr){
              res.status(200).send(movie);
            } else {
              res.status(500).send("Server is unable to update movie rating; "
		  + "please try again later " + saveErr.message);
            };
          });
   });
};

exports.deleteMovie = function(req, res) {
  Movie.findById(req.params.id, function(ferr, movie){
    if (ferr) {  // should have 2 tests, one for ferr and one for !movie
      res.status(404).send("Movie not found; unable to delete");
    } else {
        var path = __dirname + '/../public/' + movie.get('poster');
        movie.remove(function(merr){
          if (!merr) {
	    // movie successfully deleted, remove its reviews
	    // a real server would aggregate error status of various
	    // error for response, here we just log errors for Reviews/file
            Review.remove({'movieid': req.params.id}, function(rerr,rems) {
                if (rerr) {
                    console.log('error when removing reviews for movie id: ',
                	    req.params.id, rerr);
		} else {
                    console.log('removed reviews');
		};
            });
	    // movie successfully deleted, remove its image file
	    // special case placeholder img (don't remove it)
	    if (movie.get('poster') !== 'img/placeholder.png') {
              fs.unlink(path, function(uerr) {
		// a real server would take more thorough steps
                if (uerr) {
                    console.log('Error unlinking ' + path);
	        } else {
                    console.log('Unlinked image ' + path);
                };
              });
	    };
            res.status(200).send({"responseText": "movie deleted"});
	  } else {
      	    res.status(500).send("Unable to delete movie" + merr);
	  };
        });
    }
  })
};

// return reviews collection associated with given movie id
exports.getReviews = function (req, res) {
    Review.find({'movieid': req.params.id}, function(err, reviews) {
    //Review.find({'movieid': req.query.movie}, function(err, reviews) {
    //Movie.findById(req.params.id, function(err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve reviews at this time ("
                +err.message+ ")" );
        } else if (!reviews) {
            res.status(200).send({});
        } else {
            res.status(200).send(reviews);
        }
    });
};

exports.addReview = function (req, res) {
    var review = new Review(req.body);
    //review.set('movieid', req.body.movieid);
    review.set('movieid', req.params.id);
    review.save(function (err, result) {
      if (!err) {
	  Movie.findById(req.params.id, function(err, movie) {
console.log('addReview ', typeof(movie), movie, movie.freshVotes, movie.freshTotal);
              movie.freshVotes = movie.freshVotes+1;
              movie.freshTotal = movie.freshTotal+parseFloat(req.body.freshness);
console.log('addReview ', typeof(movie), movie, movie.freshVotes, movie.freshTotal);
	      movie.save(function(movieErr, movieResult) {
console.log('addReview ', typeof(movie), movie, movieErr, movieResult);
      		  if (!movieErr) {
        		res.status(200).send(result);
		  } else {
            		res.status(500).send('Unable to save review at this time: please try again later ' + movieErr.message);
		  }
	      });
	  });
      } else if (err.err && err.err.indexOf("E11000") > -1) {
            res.send(403, "Sorry, reviewer " +review.reviewname+ 
		" affiliated with " +review.reviewaffil+ 
		" already reviewed this movie");
      } else {
            res.statue(500).send('Unable to save review at this time: please try again later '
                + err.message);
      }
    });
};

exports.playMovie = function(req, res) {
    var path = require("path");
    // convert relative to absolute (beginning with /) file-system path
    var file = path.resolve(__dirname + "/../public/img/videos/"
				+req.params.id+ ".mp4");
    var range = req.headers.range;
    // range header is optional according to HTML5 spec.
    // in its absence, start position is 0, and end is movie length-1
    if (range) {
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
    } else {
	var positions = [];
	var start = 0;
    };

    // get a file-stats object for the requested video file, esp its size
    fs.stat(file, function(err, stats) {
	if (err) {
	    res.status(404).send("Error retrieving movie");
	} else {
            var total = stats.size;
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;
      
            // HTML5-compatible response-headers describing streamed video 
            res.writeHead(206, {
              "Content-Range": "bytes " + start + "-" + end + "/" + total,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": "video/mp4"
            });

            // create a ReadStream object, can specify start, end values to read
            // range of bytes rather than entire file
            var stream = fs.createReadStream(file, { start: start, end: end })
      	    // ReadStream is open
            .on("open", function() {
      	        // pipe stream data to the HTTP response object, with flow
      	        // automatically managed so destination is not overwhelmed
                stream.pipe(res);
             }).on("error", function(err) {
      	         // there was an error receiving data from the stream
      	         // stream is auto closed by default
                 res.end(err);
             });
      	 };
    });
};

exports.isAuth = function (req, res) {
console.log('isAuth ', req.session);
    if (req.session && req.session.auth) {
            res.send(200, {'userid': req.session.userid,
                'username': req.session.username});
    } else {
            res.status(200).send({'userid': '', 'username': ''});
    };
};

exports.auth = function (req, res) {
  if (req.body.login) {   // login request
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
      res.status(403).send('Invalid username-password combination, please try again');
    };
    User.findOne({username:username}, function(err, user){
      if (user !== null) {
      /* A3 ADD CODE BLOCK ... */
	  var sess = req.session;  // create session
	  sess.auth = true;
	  sess.username = username;
	  sess.userid = user.id;
	  // set session-timeout, from config file
          if (req.body.remember) {
              // if "remember me" selected on signin form,
	      // extend session to 10*default-session-timeout
	      // A3 ADD CODE BLOCK
	  }
          res.status(200).send({'userid': user.id, 'username': username});
	  // A3 ADD CODE BLOCK
      } else if (!err) {  // unrecognized username, but not DB error
        res.status(403).send('Invalid username-password combination, please try again');
      } else {  // error response from DB
        res.status(500).send("Unable to login at this time; please try again later " 
			+ err.message);
      }
    });
  } else { // logout request
    req.session.destroy(); // destroy session in the session-store
    res.status(200).send({'userid': undefined, 'username': undefined});
  };
};

exports.signup = function(req, res) {
  var user = new User(req.body);
    /* A3 ADD CODE BLOCK ... */
    // store the hashed-with-salt password in the DB
      user.password = 0;  // A3 ADD CODE
      user.save(function (serr, result) {
        if (!serr) {
          req.session.auth = true;
          req.session.username = result.username;
          req.session.userid = result.id;
          res.status(200).send({'username':result.username, 'userid':result.id});
        } else {
          console.log(serr);
          if (serr.err && serr.err.indexOf("E11000") !== -1) {
            res.status(403).send("Sorry, username '"+user.username+
                "' is already taken; please choose another username");
          } else {
            res.status(500).send("Unable to create account at this time; please try again later (" +serr.message+ ")");
          }
        }
      });
};
