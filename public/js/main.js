'use strict';

var splat =  splat || {};
 
splat.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
	"about": "about",
        "movies": "browse",
	"movies/add": "addMovie",
        "movies/:id": "editMovie",
        "movies/:id/reviews": "reviewMovie",
	"*default": "defaultRoute"
    },

    defaultRoute: function() {
	this.home();
    },

    initialize: function() {
	splat.order = "title";   // default movies collection ordering
        this.movies = new splat.Movies();  // Movies collection
	// create a jQuery promise to gate access to the fetched collection
        this.moviesLoaded = this.movies.fetch();
        this.headerView = new splat.Header();
        $('.header').html(this.headerView.render().el);
    },

    home: function() {
        if (!this.homeView) {
            this.homeView = new splat.Home();
        };
        splat.app.showView('#content', this.homeView);
	// hilite "Splat!" in header
        this.headerView.selectMenuItem('home-menu'); 
    },

    about: function() {
        if (!this.aboutView) {
            this.aboutView = new splat.About();
        };
        splat.app.showView('#content', this.aboutView);
        // hilite "About" in header
        this.headerView.selectMenuItem('about-menu');
    },

    browse: function() {
	var self = this;
        this.moviesBrowse = this.movies.fetch();
	this.moviesBrowse.done(function() {
	    splat.moviesView = new splat.MoviesView({collection:self.movies});
            splat.app.showView('#content', splat.moviesView);
	});
        this.headerView.selectMenuItem('browse-menu'); 
    },

    editMovie: function(id) {
	var self = this;
	// async update collection in case another user has made a change
        this.editFetch = this.movies.fetch();
	this.editFetch.done(function() {
	    self.movieView(id);
	});
	// no menu item active at this point
	this.headerView.selectMenuItem();
    },

    movieView: function(id) {
        var movieModel = this.movies.get(id);  // get model from collection
        // display error if invalid id is provided
        if (!movieModel) {
            splat.utils.showAlert('Error',
		"can't find this movie (perhaps deleted?)", 'alert-danger');
        } else {
            var detailsView = new splat.Details({model: movieModel});
            splat.app.showView('#content', detailsView);
        }
    },

    addMovie: function() {
        var movie = new splat.Movie();  // create new Movie
	// Details expects movie to have a collection
	movie.collection = this.movies; 
	this.moviesLoaded.done(function() {
            var detailsView = new splat.Details({model: movie});
            splat.app.showView('#content', detailsView);
	});
        this.headerView.selectMenuItem('add-menu');  // Add menu item active
    },

    reviewMovie: function(id) {
	var self = this;
        // id identifies the movie whose reviews are to be displayed.
        // Newly-added movies don't yet have an id value nor reviews.
	this.moviesLoaded.done(function() {
            if (id) {
 		// get model from collection
                var movieModel = self.movies.get(id);
	        movieModel.reviews.fetch({
		    silent:true,
		    success: function(coll, resp) {
	    	        self.reviewsView = new splat.ReviewsView(
                	    { model: movieModel,
                              collection: coll
                        });
                        splat.app.showView('#content', self.reviewsView);
		    }
	        });
            } else {
                self.$('#reviews').html('<h3>No Reviews Yet</h3>');
            }
	});
    },

    /* showView invokes close() on the currentView before replacing it
       with the new view, in order to avoid memory leaks and ghost views.
       Note that for composite views (views with subviews), must make sure
       to close “child” views when the parent is closed.  The parent view
       should keep track of its child views so it can call their respective
       close() methods when its own close() method is invoked. The
       beforeClose() method (explained above) of the parent View is a good
       place to close child Views. */
    showView: function(selector, view) {
        if (this.currentView) {
            this.currentView.close();
	}
        $(selector).html(view.render().el);
        return this.currentView;
    }

});

Backbone.View.prototype.close = function () {
    /* When closing a view, give it a chance to perform it's own custom
     * onClose processing, e.g. handle subview closes, then remove the
     * view from the DOM and unbind events from it.  Based on approach 
     * suggested by D. Bailey (author of Marionette) */
    if (this.onClose) {
        this.onClose();
    }
    this.remove();
    this.unbind();  // implied by remove() in BB 1.0.0 and later

};

splat.utils.loadTemplates(['Home', 'Header', 'About', 'MovieThumb',
	'Details', 'MovieForm', 'MovieImg', 'Reviewer', 'ReviewsView',
	'Signup', 'Signin'], function() {
    splat.app = new splat.AppRouter();
    Backbone.history.start();
});
