"use strict";

var splat =  splat || {};

splat.ReviewsView = Backbone.View.extend({

    initialize: function() {
        if (!this.review) {  // if review not loaded
            this.review = new splat.Review();
	    this.review.set('movieid', this.model.get('_id'));
	    // could alternatively get id from Backbone.history.getFragment()
        };
	this.reviews = this.collection;
	// when a review is successfully saved (sync'd),
	// update movie's freshness score and re-render ReviewThumbs subview
        this.listenTo(this.reviews, "sync", this.showScore);
        this.listenTo(this.reviews, "sync", this.renderReviews);
    },

    render: function () {
	this.renderContent().renderReviewer().renderReviews().showScore();
	return this;
    },

    renderContent: function () {
        this.$el.html(this.template());
	return this;
    },

    renderReviewer: function () {
	if (this.reviewerview) {
	    this.reviewerview.remove();
	};
        this.reviewerview = new splat.Reviewer({
	        model:this.review,
	        collection:this.collection
	});
	this.$('#myreview').append(this.reviewerview.render().el);
	return this;
    },

    renderReviews: function () {
	if (this.reviewthumbs) {
	    this.reviewthumbs.remove();
	};

        this.reviewthumbs = new splat.ReviewThumbs({ 
            collection:this.collection
        });
        this.$('#reviews').html(this.reviewthumbs.render().el);
        return this;
    },

    showScore: function() {
	var self = this;
	// fetch movie model to retrieve current freshTotal, freshVotes values
	this.model.fetch({
	    success: function(model, response) {
		if (self.collection.length > 0) {
		    $.get('tpl/Score.html', function(data) {
		        var template = _.template(data);
		        self.$('#scoreView').html(template(self.model.toJSON()));
		    });
		} else {
		    self.$('#scoreCount').html('<span>... no reviews yet</span>');
		}
            },
            error: function(model, err) {
                splat.utils.requestFailed(err);
            }
	});
    },

    onClose: function() {
        // before closing view, remove child views
        if (this.reviewerview) { this.reviewerview.remove() };
        if (this.reviewthumbs) { this.reviewthumbs.remove() };
        if (this.scoreview) { this.scoreview.remove() };
    }

});
