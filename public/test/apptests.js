QUnit.jUnitReport = function(report) {
    console.log(report.xml);   // send XML output report to console
}

 test('Check model initialization parameters and default values', function() {

  //create a new instance of a User model 
  var user = new splat.User({username: "Noah", password: "Jonah"});
  // test that model has parameter attributes
  equal(user.get("username"), "Noah", "User title set correctly");
  equal(user.get("password"), "Jonah", "User director set correctly");

  // test that Movie model has correct default values upon instantiation
  var movie = new splat.Movie();
  equal(movie.get("poster"), "img/placeholder.png",
	"Movie default value set correctly");
 });

 test( "Inspect jQuery.getJSON's usage of jQuery.ajax", function() {
    this.spy( jQuery, "ajax" );
    var getJSONDone = jQuery.getJSON( "http://cms-chorus.utsc.utoronto.ca:28012/movies" );
    ok( jQuery.ajax.calledOnce );
    equal( jQuery.ajax.getCall(0).args[0].url,
	"http://cms-chorus.utsc.utoronto.ca:28012/movies" );
    equal( jQuery.ajax.getCall(0).args[0].dataType, "json" );
  });

 test("Fires a custom event when the state changes.", function() {
    var changeModelCallback = this.spy();
    var movie = new splat.Movie();
    movie.bind( "change", changeModelCallback );
    movie.set( { "title": "Interstellar" } );
    ok( changeModelCallback.calledOnce,
	"A change event-callback was correctly triggered" );
  });

 test("Test movie model/collection add/save, and callback functions.", function(assert) {
    assert.expect(4);   // 4 assertions to be run
    var done1 = assert.async();
    var done2 = assert.async();
    var errorCallback = this.spy();
    var movie = new splat.Movie({"__v":0,"dated":"2015-10-21T20:44:27.403Z",
	"director":"Sean Penn","duration":109,"freshTotal":18,"freshVotes":27,
	"poster":"img/uploads/5627f969b8236b2b7c0a37b6.jpeg?1448200894795",
	"rating":"R","released":"1999","synopsis":"great thriller",
	"title":"Zorba Games","trailer":"http://archive.org",
	"userid":"54635fe6a1342684065f6959", "genre":["action"],
	"starring":["Bruce Willis,Amy Winemouse"]});  // model
    var movies = new splat.Movies();  // collection
    // verify Movies-collection URL
    equal( movies.url, "/movies",
		"correct URL set for instantiated Movies collection" );
    // test "add" event callback when movie added to collection
    var addModelCallback = this.spy();
    movies.bind( "add", addModelCallback );
    movies.add(movie);
    ok( addModelCallback.called,
		 "add callback triggered by movies collection add()" );
    // make sure user is logged out
    var user = new splat.User({username:"a", password:"a"});
    var auth = user.save(null, {
        type: 'put',
	success: function (model, resp) {
	    assert.deepEqual( resp, {}, "Signout returns empty response object" );
    	    done1();

	}
    });
    auth.done(function() { 
	movie.save(null, {
	    error: function (model, error) {
	        assert.equal( error.status, 403,
		    "Saving without authentication returns 403 status");
	        done2();
	    }
       });
    });
  });

 test("Test movie-delete triggers an error event if unauthenticated.", function(assert) {
    var done1 = assert.async();
    var done2 = assert.async();
    var movie = new splat.Movie();  // model
    var movies = new splat.Movies();  // collection
    movies.add(movie);
    movie.set({"_id": "557761f092e40db92c3ccdae"});
    // make sure user is logged out
    var user = new splat.User({username:"a", password:"a"});
    var auth = user.save(null, {
        type: 'put',
	success: function (model, resp) {
	    assert.deepEqual( resp, {}, "Signout returns empty response object" );
    	    done1();

	}
    });
    auth.done(function() { 
        // try to destroy an existing movie
        movie.destroy({
	    error: function (model, resp) {
	        assert.equal( resp.status, 403,
		    "Deleting without authentication returns 403 status code" );
	        done2();
	    }
        });
    });
  });

 test("Test movie-save succeeds if session is authenticated.", function(assert) {
    assert.expect( 3 );
    var done1 = assert.async();
    var done2 = assert.async();
    var done3 = assert.async();
    var movie = new splat.Movie();  // model
    movie.set("_id", "5650bf6b6f3c0a143c50994e");
    movie.urlRoot = '/movies';
    // fetch existing movie model
    var movieFetch = movie.fetch({
        success: function(movie, resp) {
            assert.equal( resp._id, "5650bf6b6f3c0a143c50994e",
		"Successful movie fetch" );
	    done1();
        }
    });
    // authenticate user with valid credentials
    var user = new splat.User({username:"a", password:"a", login: 1});
    var auth = user.save(null, {
        type: 'put',
        success: function (model, resp) {
            assert.equal( resp.username, "a",
		"Successful login with valid credentials" );
            done2();
        }
    });
    $.when(movieFetch, auth).done(function() {
        // attempt to update existing movie
        movie.save({"title": "QUnit!"}, {
    	    success: function (model, resp) {
    	        assert.equal( resp.title, "QUnit!",
			"Saving model update succeeds when logged in" );
		done3();
    	    }
        });
    });
  });

test("test1", function(assert){});
test("test2", function(assert){});
test("asynchronous test1", function(assert){});
test("asynchronous test2", function(assert){});
test("asynchronous test3", function(assert){});
