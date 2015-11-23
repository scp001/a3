"use strict";

var splat =  splat || {};

// note View-name (Reviewer) matches name of template Reviewer.html
splat.Reviewer = Backbone.View.extend({

    initialize: function (options) {
        this.model.bind("destroy", this.close, this);
	this.reviews = this.collection;
	this.model.collection = this.collection;
    },

    events: {
        "change .reviewform"  : "change",
        "click #reviewsave"   : "saveReview",
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
	return this;
    },

    change: function (event) {
        // Remove any existing alert message
        splat.utils.hideAlert();
        var change = {};
        // Apply change to the model;
        // change event triggered once for each field-value change
        change[event.target.name] = event.target.value;
        // reflect changes in the model
        this.model.set(change);
    },

    saveReview: function(event) {
        var self = this;
	self.reviews.create(self.model, {
       	    wait: true,
            success: function(model, response) {
		// reinstantiate model and re-render to clear form
		self.model = new splat.Review();
		self.model.collection = self.reviews;
		self.render();
                splat.utils.showAlert('Success!', 'Review saved', 'alert-success');
            },
            error: function (model, err) {
                splat.utils.showAlert('Error', err.responseText, 'alert-danger');
            }
        });
    }

});
