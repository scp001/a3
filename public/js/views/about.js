"use strict";

var splat =  splat || {};

splat.About = Backbone.View.extend({

    initialize: function () {
	this.render();
    },

    render: function () {
	this.$el.html(this.template());
	return this;
    }

});
