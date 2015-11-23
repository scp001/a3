'use strict';

var splat =  splat || {};

splat.Reviews = Backbone.Collection.extend({
    model: splat.Review,
    url: '/movies/:id/reviews'  // to persist the collection via server API
});
