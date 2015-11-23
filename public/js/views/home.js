"use strict";

var splat =  splat || {};

// note View-name (Home) matches name of template Home.html
splat.Home = Backbone.View.extend({

    render: function () {
	this.$el.html(this.template());  // create DOM content for Home
	return this;    // support chaining
    }

});
