"use strict";

var splat =  splat || {};

splat.ReviewThumbs = Backbone.View.extend({

    // Underscore template function to produce browse view from 
    // partial thumbnail templates.
    reviewsTemplate: _.template([
        "<% reviews.each(function(review) { %>",
            "<%= reviewTemplate(review.toJSON()) %>",
        "<% }); %>",
    ].join('')),

    render: function() {
	if (this.collection.length === 0) {
	   // No reviews yet; insert info message
           this.$el.prepend("<h3 style='color:white'>No Reviews Yet</h3>");
	} else {
	    var self = this;
            $.get('tpl/ReviewItem.html', function(reviewMarkup) {
	        var template = _.template(reviewMarkup);
                var markup = self.reviewsTemplate({
                    reviews: self.collection,
                    reviewTemplate: template
                });
                $(self.el).html(markup);
	    });
	};

	return this;
    }

});
