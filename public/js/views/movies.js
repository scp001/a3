"use strict";

var splat =  splat || {};

splat.MoviesView = Backbone.View.extend({

    // Load the movie-view (thumbnail) template file (asynchronously)
    // When an orderevent is triggered from navbar, re-render the collection
    initialize: function (options) {
	this.listenTo(Backbone, 'orderevent', this.render);
    },

    // Underscore template function to produce browse view from 
    // partial thumbnail templates.
    moviesTemplate: _.template([
        "<% movies.each(function(movie) { %>",
            "<%= movieTemplate(movie.toJSON()) %>",
        "<% }); %>",
    ].join('')),

    render: function() {
        this.movieTemplate = new splat.MovieThumb();
        this.collection.comparator = function(movie) {
    	    return movie.get(splat.order).toLowerCase();
        };
        this.collection.sort();
        var html = this.moviesTemplate({
            movies: this.collection,
            movieTemplate: this.movieTemplate.template
        });
        $(this.el).html(html);

        return this;
    },

    onClose: function() {
        this.remove();
    }

});
