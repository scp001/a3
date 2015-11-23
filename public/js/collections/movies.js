'use strict';

var splat =  splat || {};

splat.Movies = Backbone.Collection.extend({
    model:splat.Movie,

    url:'/movies'   //A2-A3  persist models with server API
});
